export const schemaDefaults = {
  timestamps: true,
  versionKey: false,
  strict: "throw",
  suppressReservedKeysWarning: true,
  toJSON: {
    transform(_doc, ret) {
      delete ret._id;
      delete ret.passwordHash;
      delete ret.refreshTokenHash;
      delete ret.resetTokenHash;
      delete ret.emailVerificationTokenHash;
      return ret;
    },
  },
};
