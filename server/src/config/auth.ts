
const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret || jwtSecret.length < 32) {
  throw new Error(
    "JWT_SECRET must be defined and contain at least 32 characters"
  );
}

const jwtExpiresIn = process.env.JWT_EXPIRES_IN || "1d";

const bcryptSaltRounds = Number(
  process.env.BCRYPT_SALT_ROUNDS || 12
);

if (
  !Number.isInteger(bcryptSaltRounds) ||
  bcryptSaltRounds < 10 ||
  bcryptSaltRounds > 15
) {
  throw new Error(
    "BCRYPT_SALT_ROUNDS must be an integer between 10 and 15"
  );
}

const authConfig = {
  jwtSecret,
  jwtExpiresIn,
  bcryptSaltRounds,
};

export default authConfig;
