// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

package plugin

import (
	"encoding/json"
	"os"
	"path/filepath"
	"testing"

	"github.com/stretchr/testify/require"

	"github.com/mattermost/mattermost/server/public/model"
	"github.com/mattermost/mattermost/server/public/shared/mlog"
)

func TestAvailablePlugins(t *testing.T) {
	dir, err1 := os.MkdirTemp("", "mm-plugin-test")
	require.NoError(t, err1)
	t.Cleanup(func() {
		os.RemoveAll(dir)
	})

	logger := mlog.CreateConsoleTestLogger(t)
	env := Environment{
		pluginDir: dir,
		logger:    logger,
	}

	t.Run("Should be able to load available plugins", func(t *testing.T) {
		bundle1 := model.BundleInfo{
			Manifest: &model.Manifest{
				Id:      "someid",
				Version: "1",
			},
		}
		err := os.Mkdir(filepath.Join(dir, "plugin1"), 0700)
		require.NoError(t, err)
		defer os.RemoveAll(filepath.Join(dir, "plugin1"))

		path := filepath.Join(dir, "plugin1", "plugin.json")
		manifestJSON, jsonErr := json.Marshal(bundle1.Manifest)
		require.NoError(t, jsonErr)
		err = os.WriteFile(path, manifestJSON, 0644)
		require.NoError(t, err)

		bundles, err := env.Available()
		require.NoError(t, err)
		require.Len(t, bundles, 1)
	})

	t.Run("Should not be able to load plugins without a valid manifest file", func(t *testing.T) {
		err := os.Mkdir(filepath.Join(dir, "plugin2"), 0700)
		require.NoError(t, err)
		defer os.RemoveAll(filepath.Join(dir, "plugin2"))

		path := filepath.Join(dir, "plugin2", "manifest.json")
		err = os.WriteFile(path, []byte("{}"), 0644)
		require.NoError(t, err)

		bundles, err := env.Available()
		require.NoError(t, err)
		require.Len(t, bundles, 0)
	})

	t.Run("Should not be able to load plugins without a manifest file", func(t *testing.T) {
		err := os.Mkdir(filepath.Join(dir, "plugin3"), 0700)
		require.NoError(t, err)
		defer os.RemoveAll(filepath.Join(dir, "plugin3"))

		bundles, err := env.Available()
		require.NoError(t, err)
		require.Len(t, bundles, 0)
	})
}
