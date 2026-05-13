const calculateCalories = (met, weight, duration) => {

    const hours = duration / 60;
  
    return Math.round(
      met * weight * hours
    );
  
  };
  
  module.exports = calculateCalories;