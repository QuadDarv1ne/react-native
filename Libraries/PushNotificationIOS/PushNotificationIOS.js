/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @flow
 */

import NativeEventEmitter from '../EventEmitter/NativeEventEmitter';
import NativePushNotificationManagerIOS from './NativePushNotificationManagerIOS';
import invariant from 'invariant';
import Platform from '../Utilities/Platform';

type NativePushNotificationIOSEventDefinitions = {
  remoteNotificationReceived: [
    {
      notificationId: string,
      remote: boolean,
      ...
    },
  ],
  remoteNotificationsRegistered: [
    {
      deviceToken?: ?string,
      ...
    },
  ],
  remoteNotificationRegistrationError: [
    {
      message: string,
      code: number,
      details: {...},
    },
  ],
  localNotificationReceived: [{...}],
};

const PushNotificationEmitter =
  new NativeEventEmitter<NativePushNotificationIOSEventDefinitions>(
    // T88715063: NativeEventEmitter only used this parameter on iOS. Now it uses it on all platforms, so this code was modified automatically to preserve its behavior
    // If you want to use the native module on other platforms, please remove this condition and test its behavior
    Platform.OS !== 'ios' ? null : NativePushNotificationManagerIOS,
  );

const _notifHandlers = new Map();

const DEVICE_NOTIF_EVENT = 'remoteNotificationReceived';
const NOTIF_REGISTER_EVENT = 'remoteNotificationsRegistered';
const NOTIF_REGISTRATION_ERROR_EVENT = 'remoteNotificationRegistrationError';
const DEVICE_LOCAL_NOTIF_EVENT = 'localNotificationReceived';

export type ContentAvailable = 1 | null | void;

export type FetchResult = {
  NewData: string,
  NoData: string,
  ResultFailed: string,
  ...
};

/**
 * An event emitted by PushNotificationIOS.
 */
export type PushNotificationEventName = $Keys<{
  /**
   * Fired when a remote notification is received. The handler will be invoked
   * with an instance of `PushNotificationIOS`.
   */
  notification: string,
  /**
   * Fired when a local notification is received. The handler will be invoked
   * with an instance of `PushNotificationIOS`.
   */
  localNotification: string,
  /**
   * Fired when the user registers for remote notifications. The handler will be
   * invoked with a hex string representing the deviceToken.
   */
  register: string,
  /**
   * Fired when the user fails to register for remote notifications. Typically
   * occurs when APNS is having issues, or the device is a simulator. The
   * handler will be invoked with {message: string, code: number, details: any}.
   */
  registrationError: string,
  ...
}>;

/**
 *
 * Handle push notifications for your app, including permission handling and
 * icon badge number.
 *
 * See https://reactnative.dev/docs/pushnotificationios
 */
class PushNotificationIOS {
  _data: Object;
  _alert: string | Object;
  _sound: string;
  _category: string;
  _contentAvailable: ContentAvailable;
  _badgeCount: number;
  _notificationId: string;
  _isRemote: boolean;
  _remoteNotificationCompleteCallbackCalled: boolean;
  _threadID: string;

  static FetchResult: FetchResult = {
    NewData: 'UIBackgroundFetchResultNewData',
    NoData: 'UIBackgroundFetchResultNoData',
    ResultFailed: 'UIBackgroundFetchResultFailed',
  };

  /**
   * Schedules the localNotification for immediate presentation.
   *
   * See https://reactnative.dev/docs/pushnotificationios#presentlocalnotification
   */
  static presentLocalNotification(details: Object) {
    invariant(
      NativePushNotificationManagerIOS,
      'PushNotificationManager is not available.',
    );
    NativePushNotificationManagerIOS.presentLocalNotification(details);
  }

  /**
   * Schedules the localNotification for future presentation.
   *
   * See https://reactnative.dev/docs/pushnotificationios#schedulelocalnotification
   */
  static scheduleLocalNotification(details: Object) {
    invariant(
      NativePushNotificationManagerIOS,
      'PushNotificationManager is not available.',
    );
    NativePushNotificationManagerIOS.scheduleLocalNotification(details);
  }

  /**
   * Cancels all scheduled localNotifications.
   *
   * See https://reactnative.dev/docs/pushnotificationios#cancelalllocalnotifications
   */
  static cancelAllLocalNotifications() {
    invariant(
      NativePushNotificationManagerIOS,
      'PushNotificationManager is not available.',
    );
    NativePushNotificationManagerIOS.cancelAllLocalNotifications();
  }

  /**
   * Remove all delivered notifications from Notification Center.
   *
   * See https://reactnative.dev/docs/pushnotificationios#removealldeliverednotifications
   */
  static removeAllDeliveredNotifications(): void {
    invariant(
      NativePushNotificationManagerIOS,
      'PushNotificationManager is not available.',
    );
    NativePushNotificationManagerIOS.removeAllDeliveredNotifications();
  }

  /**
   * Provides you with a list of the app’s notifications that are still displayed in Notification Center.
   *
   * See https://reactnative.dev/docs/pushnotificationios#getdeliverednotifications
   */
  static getDeliveredNotifications(
    callback: (notifications: Array<Object>) => void,
  ): void {
    invariant(
      NativePushNotificationManagerIOS,
      'PushNotificationManager is not available.',
    );
    NativePushNotificationManagerIOS.getDeliveredNotifications(callback);
  }

  /**
   * Removes the specified notifications from Notification Center
   *
   * See https://reactnative.dev/docs/pushnotificationios#removedeliverednotifications
   */
  static removeDeliveredNotifications(identifiers: Array<string>): void {
    invariant(
      NativePushNotificationManagerIOS,
      'PushNotificationManager is not available.',
    );
    NativePushNotificationManagerIOS.removeDeliveredNotifications(identifiers);
  }

  /**
   * Sets the badge number for the app icon on the home screen.
   *
   * See https://reactnative.dev/docs/pushnotificationios#setapplicationiconbadgenumber
   */
  static setApplicationIconBadgeNumber(number: number) {
    invariant(
      NativePushNotificationManagerIOS,
      'PushNotificationManager is not available.',
    );
    NativePushNotificationManagerIOS.setApplicationIconBadgeNumber(number);
  }

  /**
   * Gets the current badge number for the app icon on the home screen.
   *
   * See https://reactnative.dev/docs/pushnotificationios#getapplicationiconbadgenumber
   */
  static getApplicationIconBadgeNumber(callback: Function) {
    invariant(
      NativePushNotificationManagerIOS,
      'PushNotificationManager is not available.',
    );
    NativePushNotificationManagerIOS.getApplicationIconBadgeNumber(callback);
  }

  /**
   * Cancel local notifications.
   *
   * See https://reactnative.dev/docs/pushnotificationios#cancellocalnotification
   */
  static cancelLocalNotifications(userInfo: Object) {
    invariant(
      NativePushNotificationManagerIOS,
      'PushNotificationManager is not available.',
    );
    NativePushNotificationManagerIOS.cancelLocalNotifications(userInfo);
  }

  /**
   * Gets the local notifications that are currently scheduled.
   *
   * See https://reactnative.dev/docs/pushnotificationios#getscheduledlocalnotifications
   */
  static getScheduledLocalNotifications(callback: Function) {
    invariant(
      NativePushNotificationManagerIOS,
      'PushNotificationManager is not available.',
    );
    NativePushNotificationManagerIOS.getScheduledLocalNotifications(callback);
  }

  /**
   * Attaches a listener to remote or local notification events while the app
   * is running in the foreground or the background.
   *
   * See https://reactnative.dev/docs/pushnotificationios#addeventlistener
   */
  static addEventListener(type: PushNotificationEventName, handler: Function) {
    invariant(
      type === 'notification' ||
        type === 'register' ||
        type === 'registrationError' ||
        type === 'localNotification',
      'PushNotificationIOS only supports `notification`, `register`, `registrationError`, and `localNotification` events',
    );
    let listener;
    if (type === 'notification') {
      listener = PushNotificationEmitter.addListener(
        DEVICE_NOTIF_EVENT,
        notifData => {
          handler(new PushNotificationIOS(notifData));
        },
      );
    } else if (type === 'localNotification') {
      listener = PushNotificationEmitter.addListener(
        DEVICE_LOCAL_NOTIF_EVENT,
        notifData => {
          handler(new PushNotificationIOS(notifData));
        },
      );
    } else if (type === 'register') {
      listener = PushNotificationEmitter.addListener(
        NOTIF_REGISTER_EVENT,
        registrationInfo => {
          handler(registrationInfo.deviceToken);
        },
      );
    } else if (type === 'registrationError') {
      listener = PushNotificationEmitter.addListener(
        NOTIF_REGISTRATION_ERROR_EVENT,
        errorInfo => {
          handler(errorInfo);
        },
      );
    }
    _notifHandlers.set(type, listener);
  }

  /**
   * Removes the event listener. Do this in `componentWillUnmount` to prevent
   * memory leaks.
   *
   * See https://reactnative.dev/docs/pushnotificationios#removeeventlistener
   */
  static removeEventListener(
    type: PushNotificationEventName,
    handler: Function,
  ) {
    invariant(
      type === 'notification' ||
        type === 'register' ||
        type === 'registrationError' ||
        type === 'localNotification',
      'PushNotificationIOS only supports `notification`, `register`, `registrationError`, and `localNotification` events',
    );
    const listener = _notifHandlers.get(type);
    if (!listener) {
      return;
    }
    listener.remove();
    _notifHandlers.delete(type);
  }

  /**
   * Requests notification permissions from iOS, prompting the user's
   * dialog box. By default, it will request all notification permissions, but
   * a subset of these can be requested by passing a map of requested
   * permissions.
   *
   * See https://reactnative.dev/docs/pushnotificationios#requestpermissions
   */
  static requestPermissions(permissions?: {
    alert?: boolean,
    badge?: boolean,
    sound?: boolean,
    ...
  }): Promise<{
    alert: boolean,
    badge: boolean,
    sound: boolean,
    ...
  }> {
    let requestedPermissions = {
      alert: true,
      badge: true,
      sound: true,
    };
    if (permissions) {
      requestedPermissions = {
        alert: !!permissions.alert,
        badge: !!permissions.badge,
        sound: !!permissions.sound,
      };
    }
    invariant(
      NativePushNotificationManagerIOS,
      'PushNotificationManager is not available.',
    );
    return NativePushNotificationManagerIOS.requestPermissions(
      requestedPermissions,
    );
  }

  /**
   * Unregister for all remote notifications received via Apple Push Notification service.
   *
   * See https://reactnative.dev/docs/pushnotificationios#abandonpermissions
   */
  static abandonPermissions() {
    invariant(
      NativePushNotificationManagerIOS,
      'PushNotificationManager is not available.',
    );
    NativePushNotificationManagerIOS.abandonPermissions();
  }

  /**
   * See what push permissions are currently enabled. `callback` will be
   * invoked with a `permissions` object.
   *
   * See https://reactnative.dev/docs/pushnotificationios#checkpermissions
   */
  static checkPermissions(callback: Function) {
    invariant(typeof callback === 'function', 'Must provide a valid callback');
    invariant(
      NativePushNotificationManagerIOS,
      'PushNotificationManager is not available.',
    );
    NativePushNotificationManagerIOS.checkPermissions(callback);
  }

  /**
   * This method returns a promise that resolves to either the notification
   * object if the app was launched by a push notification, or `null` otherwise.
   *
   * See https://reactnative.dev/docs/pushnotificationios#getinitialnotification
   */
  static getInitialNotification(): Promise<?PushNotificationIOS> {
    invariant(
      NativePushNotificationManagerIOS,
      'PushNotificationManager is not available.',
    );
    return NativePushNotificationManagerIOS.getInitialNotification().then(
      notification => {
        return notification && new PushNotificationIOS(notification);
      },
    );
  }

  /**
   * This method returns a promise that resolves to notification authorization status.
   */
  static getAuthorizationStatus(
    callback: (authorizationStatus: number) => void,
  ): void {
    invariant(
      NativePushNotificationManagerIOS,
      'PushNotificationManager is not available.',
    );

    NativePushNotificationManagerIOS.getAuthorizationStatus(callback);
  }

  /**
   * You will never need to instantiate `PushNotificationIOS` yourself.
   * Listening to the `notification` event and invoking
   * `getInitialNotification` is sufficient
   *
   */
  constructor(nativeNotif: Object) {
    this._data = {};
    this._remoteNotificationCompleteCallbackCalled = false;
    this._isRemote = nativeNotif.remote;
    if (this._isRemote) {
      this._notificationId = nativeNotif.notificationId;
    }

    if (nativeNotif.remote) {
      // Extract data from Apple's `aps` dict as defined:
      // https://developer.apple.com/library/ios/documentation/NetworkingInternet/Conceptual/RemoteNotificationsPG/Chapters/ApplePushService
      Object.keys(nativeNotif).forEach(notifKey => {
        const notifVal = nativeNotif[notifKey];
        if (notifKey === 'aps') {
          this._alert = notifVal.alert;
          this._sound = notifVal.sound;
          this._badgeCount = notifVal.badge;
          this._category = notifVal.category;
          this._contentAvailable = notifVal['content-available'];
          this._threadID = notifVal['thread-id'];
        } else {
          this._data[notifKey] = notifVal;
        }
      });
    } else {
      // Local notifications aren't being sent down with `aps` dict.
      this._badgeCount = nativeNotif.applicationIconBadgeNumber;
      this._sound = nativeNotif.soundName;
      this._alert = nativeNotif.alertBody;
      this._data = nativeNotif.userInfo;
      this._category = nativeNotif.category;
    }
  }

  /**
   * This method is available for remote notifications that have been received via:
   * `application:didReceiveRemoteNotification:fetchCompletionHandler:`
   *
   * See https://reactnative.dev/docs/pushnotificationios#finish
   */
  finish(fetchResult: string) {
    if (
      !this._isRemote ||
      !this._notificationId ||
      this._remoteNotificationCompleteCallbackCalled
    ) {
      return;
    }
    this._remoteNotificationCompleteCallbackCalled = true;

    invariant(
      NativePushNotificationManagerIOS,
      'PushNotificationManager is not available.',
    );
    NativePushNotificationManagerIOS.onFinishRemoteNotification(
      this._notificationId,
      fetchResult,
    );
  }

  /**
   * An alias for `getAlert` to get the notification's main message string
   */
  getMessage(): ?string | ?Object {
    // alias because "alert" is an ambiguous name
    return this._alert;
  }

  /**
   * Gets the sound string from the `aps` object
   *
   * See https://reactnative.dev/docs/pushnotificationios#getsound
   */
  getSound(): ?string {
    return this._sound;
  }

  /**
   * Gets the category string from the `aps` object
   *
   * See https://reactnative.dev/docs/pushnotificationios#getcategory
   */
  getCategory(): ?string {
    return this._category;
  }

  /**
   * Gets the notification's main message from the `aps` object
   *
   * See https://reactnative.dev/docs/pushnotificationios#getalert
   */
  getAlert(): ?string | ?Object {
    return this._alert;
  }

  /**
   * Gets the content-available number from the `aps` object
   *
   * See https://reactnative.dev/docs/pushnotificationios#getcontentavailable
   */
  getContentAvailable(): ContentAvailable {
    return this._contentAvailable;
  }

  /**
   * Gets the badge count number from the `aps` object
   *
   * See https://reactnative.dev/docs/pushnotificationios#getbadgecount
   */
  getBadgeCount(): ?number {
    return this._badgeCount;
  }

  /**
   * Gets the data object on the notif
   *
   * See https://reactnative.dev/docs/pushnotificationios#getdata
   */
  getData(): ?Object {
    return this._data;
  }

  /**
   * Gets the thread ID on the notif
   *
   * See https://reactnative.dev/docs/pushnotificationios#getthreadid
   */
  getThreadID(): ?string {
    return this._threadID;
  }
}

module.exports = PushNotificationIOS;
