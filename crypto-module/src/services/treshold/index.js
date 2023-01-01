const treshold = (configs) => {
    return {
        generateAddress: require('./generate-address')(configs),
    }
}
  
module.exports = treshold;