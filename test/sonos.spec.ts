import { SonosManager } from '@svrooij/sonos/lib';
import { equal } from 'assert';


describe('Sonos manager', () => {
  it('should be able to execute a test', () => {
    equal(true, true);
  });

  it('should be able to execute a test2', async () => {
    const manager = new SonosManager();
    await manager.InitializeWithDiscovery();
    let played = false;
    for (const d of manager.Devices) {
      console.log('Device %s is joined in %s - %s', d.Name, d.GroupName, d.Host);
      if (d.Name === 'Kontor') {
        played = await d.PlayNotification({
          trackUri: 'https://cdn.smartersoft-group.com/various/pull-bell-short.mp3', // Can be any uri sonos understands
          onlyWhenPlaying: false, // make sure that it only plays when you're listening to music. So it won't play when you're sleeping.
          timeout: 10,
          volume: 50, // Set the volume for the notification (and revert back afterwards)
          delayMs: 700, // Pause between commands in ms, (when sonos fails to play sort notification sounds).
        });
        console.log('Played notification1  %o', played);
        break;
      }
    }
    console.log('AL DONE');
    equal(played, true);
  });

  it('should be able to execute a test3', (done) => {
    const manager = new SonosManager();
    manager.InitializeWithDiscovery(10)
      .then(() => {
        manager.Devices.forEach(d => {
          console.log('Device %s is joined in %s', d.Name, d.GroupName);
          if (d.Name === 'Kontor') {
            d.PlayNotification({
              trackUri: 'https://cdn.smartersoft-group.com/various/pull-bell-short.mp3', // Can be any uri sonos understands
              onlyWhenPlaying: false, // make sure that it only plays when you're listening to music. So it won't play when you're sleeping.
              timeout: 10,
              volume: 50, // Set the volume for the notification (and revert back afterwards)
              delayMs: 700, // Pause between commands in ms, (when sonos fails to play sort notification sounds).
            }).then(played => {
              console.log('Played notification2 %o', played);
              manager.CancelSubscription();
              done();
            });
          }
        });
      })
      .catch(reason => {
        console.log('Error occurred %j', reason);
      });
  });

  console.log('DONE');
});
