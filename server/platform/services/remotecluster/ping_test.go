// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

package remotecluster

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"sync"
	"sync/atomic"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"github.com/wiggin77/merror"

	"github.com/mattermost/mattermost/server/public/model"
)

const (
	Recent = 60000
)

func TestPing(t *testing.T) {
	disablePing = false

	t.Run("No error", func(t *testing.T) {
		var countWebReq int32
		merr := merror.New()

		wg := &sync.WaitGroup{}
		wg.Add(NumRemotes)

		ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			defer wg.Done()
			defer w.WriteHeader(200)
			atomic.AddInt32(&countWebReq, 1)

			var frame model.RemoteClusterFrame
			err := json.NewDecoder(r.Body).Decode(&frame)
			if err != nil {
				merr.Append(err)
				return
			}
			if len(frame.Msg.Payload) == 0 {
				merr.Append(fmt.Errorf("Payload should not be empty; remote_id=%s", frame.RemoteId))
				return
			}

			var ping model.RemoteClusterPing
			err = json.Unmarshal(frame.Msg.Payload, &ping)
			if err != nil {
				merr.Append(err)
				return
			}
			if !checkRecent(ping.SentAt, Recent) {
				merr.Append(fmt.Errorf("timestamp out of range, got %d", ping.SentAt))
				return
			}
			if ping.RecvAt != 0 {
				merr.Append(fmt.Errorf("timestamp should be 0, got %d", ping.RecvAt))
				return
			}
		}))
		defer ts.Close()

		mockServer := newMockServer(t, makeRemoteClusters(NumRemotes, ts.URL, false))
		mockApp := newMockApp(t, nil)

		service, err := NewRemoteClusterService(mockServer, mockApp)
		require.NoError(t, err)

		err = service.Start()
		require.NoError(t, err)
		defer service.Shutdown()

		wg.Wait()

		assert.NoError(t, merr.ErrorOrNil())

		assert.Equal(t, int32(NumRemotes), atomic.LoadInt32(&countWebReq))
		t.Logf("%d web requests counted;  %d expected",
			atomic.LoadInt32(&countWebReq), NumRemotes)
	})

	t.Run("HTTP errors", func(t *testing.T) {
		var countWebReq int32
		merr := merror.New()

		wg := &sync.WaitGroup{}
		wg.Add(NumRemotes)

		ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			defer wg.Done()
			atomic.AddInt32(&countWebReq, 1)

			var frame model.RemoteClusterFrame
			err := json.NewDecoder(r.Body).Decode(&frame)
			if err != nil {
				merr.Append(err)
			}
			var ping model.RemoteClusterPing
			err = json.Unmarshal(frame.Msg.Payload, &ping)
			if err != nil {
				merr.Append(err)
			}
			if !checkRecent(ping.SentAt, Recent) {
				merr.Append(fmt.Errorf("timestamp out of range, got %d", ping.SentAt))
			}
			if ping.RecvAt != 0 {
				merr.Append(fmt.Errorf("timestamp should be 0, got %d", ping.RecvAt))
			}
			w.WriteHeader(500)
		}))
		defer ts.Close()

		mockServer := newMockServer(t, makeRemoteClusters(NumRemotes, ts.URL, false))
		mockApp := newMockApp(t, nil)

		service, err := NewRemoteClusterService(mockServer, mockApp)
		require.NoError(t, err)

		err = service.Start()
		require.NoError(t, err)
		defer service.Shutdown()

		wg.Wait()

		assert.NoError(t, merr.ErrorOrNil())

		assert.Equal(t, int32(NumRemotes), atomic.LoadInt32(&countWebReq))
		t.Logf("%d web requests counted;  %d expected",
			atomic.LoadInt32(&countWebReq), NumRemotes)
	})

	t.Run("Plugin ping", func(t *testing.T) {
		mockServer := newMockServer(t, makeRemoteClusters(NumRemotes, model.NewId(), true))
		offline := []string{mockServer.remotes[0].PluginID, mockServer.remotes[1].PluginID}

		mockApp := newMockApp(t, offline)

		service, err := NewRemoteClusterService(mockServer, mockApp)
		require.NoError(t, err)

		// high ping frequency so we don't delay unit tests.
		service.SetPingFreq(time.Millisecond * 50)

		err = service.Start()
		require.NoError(t, err)
		defer service.Shutdown()

		checkPingCount := func() bool {
			return mockApp.GetTotalPingCount() >= NumRemotes
		}

		checkErrorCount := func() bool {
			return mockApp.GetTotalPingErrorCount() >= 2
		}

		assert.Eventually(t, checkPingCount, time.Second*5, 10*time.Millisecond)
		assert.Eventually(t, checkErrorCount, time.Second*5, 10*time.Millisecond)
	})
}

func checkRecent(millis int64, within int64) bool {
	now := model.GetMillis()
	return millis > now-within && millis < now+within
}
