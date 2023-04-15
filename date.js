
exports.fullDate = () => {

    const baseDate = new Date();
    const options = { weekday: "long", year: "numeric", month: "long", day: "numeric" };
    return baseDate.toLocaleString("en-US", options);

}

exports.currentDay = () => {

    const baseDate = new Date();
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return dayNames[baseDate.getDay()];

}