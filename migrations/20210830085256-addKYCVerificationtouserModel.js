module.exports = {
  async up(db, client) {
    // See https://github.com/seppevs/migrate-mongo/#creating-a-new-migration-script
    // Example:
    await db.collection('users').updateMany(
      { },
    { $set: { isUserVerified: false } }
      );
  },

  async down(db, client) {
    await db.collection('users').updateMany(
      { },
    { $unset: { isUserVerified: false } }
    );
  }
};
