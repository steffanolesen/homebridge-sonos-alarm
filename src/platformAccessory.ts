import {
  Service, CharacteristicValue, CharacteristicSetCallback,
  CharacteristicGetCallback, AccessoryPlugin, Logging, AccessoryConfig, API,
} from 'homebridge';

import { SonosManager } from '@svrooij/sonos';

export class SonosAlarmAccessory implements AccessoryPlugin {
	private readonly log: Logging;
	private readonly name: string;
	private readonly playerName: string;
	private readonly mp3uri: string;
	private readonly volume: number;
	private readonly informationService: Service;
	private readonly switchService: Service;
  private switchState = false;

  /**
   */
  constructor(log: Logging, config: AccessoryConfig, api: API) {
    const sonosAlarmConfig = config as SonosAlarmAccessoryConfig;
    this.log = log;
    this.name = config.name;

    this.playerName = sonosAlarmConfig.playerName;
    this.mp3uri = sonosAlarmConfig.mp3uri;
    this.volume = sonosAlarmConfig.volume;

    const hap = api.hap;
    this.informationService = new hap.Service.AccessoryInformation()
      .setCharacteristic(hap.Characteristic.Manufacturer, 'Sonos Manufacturer')
      .setCharacteristic(hap.Characteristic.Model, 'Sonos Play')
      .setCharacteristic(hap.Characteristic.SerialNumber, '123-456-789');


    this.switchService = new hap.Service.Switch(this.name);
    this.switchService.getCharacteristic(hap.Characteristic.On)
      .on('set', this.setOn.bind(this))                // SET - bind to the `setOn` method below
      .on('get', this.getOn.bind(this));               // GET - bind to the `getOn` method below
  }

  getServices(): Service[] {
    return [this.informationService, this.switchService];
  }

  /**
   * Handle "SET" requests from HomeKit
   * These are sent when the user changes the state of an accessory, for example, turning on a Light bulb.
   */
  setOn(value: CharacteristicValue, callback: CharacteristicSetCallback) {
    this.switchState = value as boolean;

    this.log.debug('Set Characteristic On ->', this.switchState);

    if (value) {
      const manager = new SonosManager();
      manager.InitializeWithDiscovery(10)
        .then(() => {
          if (manager.Devices.length === 0) {
            return callback(new Error('Unable to find sonos'));
          }

          manager.Devices.forEach(d => {
            this.log.debug('Device %s is joined in %s', d.Name, d.GroupName);
            if (d.Name === this.playerName || this.playerName === "ALL") {
              d.PlayNotification({
                trackUri: this.mp3uri,
                onlyWhenPlaying: false,
                timeout: 10,
                volume: this.volume,
                delayMs: 700, // Pause between commands in ms, (when sonos fails to play sort notification sounds).
              })
                .then(played => {
                  this.log.debug('Played notification %o', played);
                  this.switchState = false;
                  callback(null);
                })
                .catch(reason => {
                  this.log.error('Error occurred %j', reason);
                  this.switchState = false;
                  callback(reason);
                });
            }
          });
        })
        .catch(reason => {
          this.log.error('Error occurred %j', reason);
          this.switchState = false;
          callback(reason);
        });
    } else {
      this.switchState = false;
      callback(null);
    }
  }

  /**
   * Handle the "GET" requests from HomeKit
   * These are sent when HomeKit wants to know the current state of the accessory, for example, checking if a Light bulb is on.
   *
   * GET requests should return as fast as possbile. A long delay here will result in
   * HomeKit being unresponsive and a bad user experience in general.
   *
   * If your device takes time to respond you should update the status of your device
   * asynchronously instead using the `updateCharacteristic` method instead.

   * @example
   * this.service.updateCharacteristic(this.platform.Characteristic.On, true)
   */
  getOn(callback: CharacteristicGetCallback) {

    // implement your own code to check if the device is on
    const isOn = this.switchState;

    this.log.debug('Get Characteristic On ->', isOn);

    // you must call the callback function
    // the first argument should be null if there were no errors
    // the second argument should be the value to return
    callback(null, isOn);
  }

}

export interface SonosAlarmAccessoryConfig extends AccessoryConfig {
	'playerName': string;
	'mp3uri': string;
	'volume': number;
}
