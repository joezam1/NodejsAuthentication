/****Option expiresIn*************
expiresIn: expressed in seconds or a string describing a time span zeit/ms.
Eg: 60, "2 days", "10h", "7d". A numeric value is interpreted as a seconds count. 
If you use a string be sure you provide the time units (days, hours, etc), 
 otherwise milliseconds unit is used by default ("120" is equal to "120ms").
*/

const TWO_HOURS = 1000 * 60 * 60 * 2;
const THIRTY_MINUTES = 1000 * 60 * 30;
const FIVE_MINUTES = 1000 * 60 * 5;
const TWO_MINUTES = 1000 * 60 * 2;
const ONE_MINUTE = 1000 * 60 * 1;
const THIRTY_SECONDS = 1000 * 30;
const TEN_SECONDS = 1000 * 10;

var millisecondsUnit_str = "";

const jwtConfig = {

    accessTokenTimeout: millisecondsUnit_str + THIRTY_MINUTES,
    refreshTokenTimeout: millisecondsUnit_str + TWO_HOURS,

    accessTokenSecret: 'thisisalongstringwithacomplexsecretinitsantadoesnotexit',
    refreshTokenSecret: 'thisisalongstringwithacomplexsecretinitlinuxisthebest',

    allRefreshTokens: [],
    accessTokenStorage:[],
}

module.exports = jwtConfig;