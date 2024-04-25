// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

package einterfaces

import (
	"database/sql"

	"github.com/mattermost/mattermost/server/public/model"
	"github.com/mattermost/mattermost/server/public/shared/mlog"
)

type MetricsInterface interface {
	Register()
	RegisterDBCollector(db *sql.DB, name string)
	UnregisterDBCollector(db *sql.DB, name string)

	IncrementPostCreate()
	IncrementWebhookPost()
	IncrementPostSentEmail()
	IncrementPostSentPush()
	IncrementPostBroadcast()
	IncrementPostFileAttachment(count int)

	IncrementHTTPRequest()
	IncrementHTTPError()

	IncrementClusterRequest()
	ObserveClusterRequestDuration(elapsed float64)
	IncrementClusterEventType(eventType model.ClusterEvent)

	IncrementLogin()
	IncrementLoginFail()

	IncrementEtagHitCounter(route string)
	IncrementEtagMissCounter(route string)

	IncrementMemCacheHitCounter(cacheName string)
	IncrementMemCacheMissCounter(cacheName string)
	IncrementMemCacheInvalidationCounter(cacheName string)
	IncrementMemCacheMissCounterSession()
	IncrementMemCacheHitCounterSession()
	IncrementMemCacheInvalidationCounterSession()

	IncrementWebsocketEvent(eventType model.WebsocketEventType)
	IncrementWebSocketBroadcast(eventType model.WebsocketEventType)
	IncrementWebSocketBroadcastBufferSize(hub string, amount float64)
	DecrementWebSocketBroadcastBufferSize(hub string, amount float64)
	IncrementWebSocketBroadcastUsersRegistered(hub string, amount float64)
	DecrementWebSocketBroadcastUsersRegistered(hub string, amount float64)
	IncrementWebsocketReconnectEvent(eventType string)

	AddMemCacheHitCounter(cacheName string, amount float64)
	AddMemCacheMissCounter(cacheName string, amount float64)

	IncrementPostsSearchCounter()
	ObservePostsSearchDuration(elapsed float64)
	IncrementFilesSearchCounter()
	ObserveFilesSearchDuration(elapsed float64)
	ObserveStoreMethodDuration(method, success string, elapsed float64)
	ObserveAPIEndpointDuration(endpoint, method, statusCode, originClient, pageLoadContext string, elapsed float64)
	IncrementPostIndexCounter()
	IncrementFileIndexCounter()
	IncrementUserIndexCounter()
	IncrementChannelIndexCounter()

	ObservePluginHookDuration(pluginID, hookName string, success bool, elapsed float64)
	ObservePluginMultiHookIterationDuration(pluginID string, elapsed float64)
	ObservePluginMultiHookDuration(elapsed float64)
	ObservePluginAPIDuration(pluginID, apiName string, success bool, elapsed float64)

	ObserveEnabledUsers(users int64)
	GetLoggerMetricsCollector() mlog.MetricsCollector

	IncrementRemoteClusterMsgSentCounter(remoteID string)
	IncrementRemoteClusterMsgReceivedCounter(remoteID string)
	IncrementRemoteClusterMsgErrorsCounter(remoteID string, timeout bool)
	ObserveRemoteClusterPingDuration(remoteID string, elapsed float64)
	ObserveRemoteClusterClockSkew(remoteID string, skew float64)
	IncrementRemoteClusterConnStateChangeCounter(remoteID string, online bool)

	IncrementSharedChannelsSyncCounter(remoteID string)
	ObserveSharedChannelsTaskInQueueDuration(elapsed float64)
	ObserveSharedChannelsQueueSize(size int64)
	ObserveSharedChannelsSyncCollectionDuration(remoteID string, elapsed float64)
	ObserveSharedChannelsSyncSendDuration(remoteID string, elapsed float64)
	ObserveSharedChannelsSyncCollectionStepDuration(remoteID string, step string, elapsed float64)
	ObserveSharedChannelsSyncSendStepDuration(remoteID string, step string, elapsed float64)

	IncrementJobActive(jobType string)
	DecrementJobActive(jobType string)

	SetReplicaLagAbsolute(node string, value float64)
	SetReplicaLagTime(node string, value float64)
}
