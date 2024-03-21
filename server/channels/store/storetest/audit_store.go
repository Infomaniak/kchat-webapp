// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

package storetest

import (
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"github.com/mattermost/mattermost/server/public/model"
	"github.com/mattermost/mattermost/server/public/shared/request"
	"github.com/mattermost/mattermost/server/v8/channels/store"
)

func TestAuditStore(t *testing.T, rctx request.CTX, ss store.Store) {
	t.Run("", func(t *testing.T) { testAuditStore(t, rctx, ss) })
}

func testAuditStore(t *testing.T, rctx request.CTX, ss store.Store) {
	audit := &model.Audit{UserId: model.NewId(), IpAddress: "ipaddress", Action: "Action"}
	require.NoError(t, ss.Audit().Save(audit))
	time.Sleep(100 * time.Millisecond)
	require.NoError(t, ss.Audit().Save(audit))
	time.Sleep(100 * time.Millisecond)
	require.NoError(t, ss.Audit().Save(audit))
	time.Sleep(100 * time.Millisecond)
	audit.ExtraInfo = "extra"
	time.Sleep(100 * time.Millisecond)
	require.NoError(t, ss.Audit().Save(audit))

	time.Sleep(100 * time.Millisecond)

	audits, err := ss.Audit().Get(audit.UserId, 0, 100)
	require.NoError(t, err)

	assert.Len(t, audits, 4)

	assert.Equal(t, "extra", audits[0].ExtraInfo)

	audits, err = ss.Audit().Get("missing", 0, 100)
	require.NoError(t, err)
	assert.Empty(t, audits)

	audits, err = ss.Audit().Get("", 0, 100)
	require.NoError(t, err)
	require.Len(t, audits, 4, "Failed to save and retrieve 4 audit logs")

	require.NoError(t, ss.Audit().PermanentDeleteByUser(audit.UserId))
}
