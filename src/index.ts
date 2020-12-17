import { API } from 'homebridge';

import { ACCESSORY_NAME, PLUGIN_NAME } from './settings';
import { SonosAlarmAccessory } from './platformAccessory';

/**
 * This method registers the accessory with Homebridge
 */
export = (api: API) => {
  api.registerAccessory(PLUGIN_NAME, ACCESSORY_NAME, SonosAlarmAccessory);
};
