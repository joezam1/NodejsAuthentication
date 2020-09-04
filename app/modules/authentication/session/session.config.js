const TWO_HOURS = 1000 * 60 * 60 * 2;
const THIRTY_MINUTES = 1000 * 60 * 30;
const FIVE_MINUTES = 1000 * 60 * 5;
const TWO_MINUTES = 1000 * 60 * 2;
const THIRTY_SECONDS = 1000 * 30;
const TEN_SECONDS = 1000 * 10;

const sessionConfig = {
    NODE_ENV: 'development',
    SESSION_NAME: 'session_id',
    SESSION_SECRET: 'longsecretstringtopreventfromguessingthesessions',
    SESSION_LIFETIME: TWO_HOURS,
}


module.exports = sessionConfig;