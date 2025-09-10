export const maxCastContentLength = 1024;
export const maxLongCastContentLength = 10000;
export const maxQaCastContentLength = 10000;
export const maxQaAskContentLength = 1000;

export const TOAST_LIMIT = 2;
export const TOAST_REMOVE_DELAY = 3000;

// Max length of text to be shown in the text view in feed
export const MAX_CHAR_LENGTH = 250;
export const MAX_QA_QUESTION_LENGTH = 68;
export const MAX_NO_OF_LINES = 6;

export const DOMAIN_TLD_PATTERN = /\.[a-z]{2,8}$/gi;
// Parse video and image only at bottom
// For non scheme URl extra check is added to break on space,'"
// For Http URL allow - in domain start as it makes the url less prone and user is entering scheme so it was added as a url
// break http url on space and comma
export const PATTERN_URL = new RegExp(
  /(?:(?<=\s)|(?<=^)|(?<=。))((?:https?:\/\/)?(?:www\.)?[\w-]+(\.[\w-]+)+([\w.,@?^=%&:/~+#-]*[\w@?^=%&/~+#-])?)/,
  'gi'
);
export const IMAGE_PATTERN = /(https?:\/\/).*\/.*\.(png|gif|webp|jpeg|jpg)/gim;
export const PATTERN_SPECIAL_CHARS_AT_END = /[.!?,;()]$/;
// Regex to identify a Farcater URI
export const FARCASTER_URI_PATTERN =
  /farcaster:\/\/casts\/([a-zA-Z0-9_]+)\/([a-zA-Z0-9_]+)/g;

export const TWITTER_SPECIAL_PATTERN = /[a-zA-Z0-9]+.twitter$/gim;
