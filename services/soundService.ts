export enum SoundType {
  CLICK = 'click',
  SUCCESS = 'success',
  FAILURE = 'failure',
  WIN = 'win',
  START = 'start',
  TURN = 'turn',
  JOIN = 'join',
  INVITE = 'invite',
  NOTIFICATION = 'notification',
}

/**
 * Plays a sound of the given type.
 * All sounds have been disabled as per the request.
 * @param sound The type of sound to play.
 */
export const playSound = (sound: SoundType) => {
  // This function is intentionally left empty to disable sounds.
  // The original implementation with Audio objects has been removed.
};
