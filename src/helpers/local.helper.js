
const base_url = `http://localhost:4000/`;
const front_base_url = `http://localhost:3000/`;


const formatDate = (str, date = new Date()) => {
  const yyyy = date.getFullYear(); //year
  const mm = padTo2Digits(date.getMonth() + 1); //month
  const dd = padTo2Digits(date.getDate()); //date
  const h = padTo2Digits(date.getHours()); //hours
  const i = padTo2Digits(date.getMinutes()); //minutes
  const s = padTo2Digits(date.getSeconds()); //seconds
  if (str === "yyyy-mm-dd") {
    return `${yyyy}-${mm}-${dd}`;
  }
  if (str === "dd-mm-yyyy") {
    return `${dd}-${mm}-${yyyy}`;
  }
  if (str === "yyyy-mm-dd h:i:s") {
    return `${yyyy}-${mm}-${dd} ${h}:${i}:${s}`;
  }
  if (str === "dd-mm-yyyy h:i:s") {
    return `${dd}-${mm}-${yyyy} ${h}:${i}:${s}`;
  }
  return date;
};

const getCurrentDateAndTime = (
  indiaTime = new Date().toLocaleString("en-US", {
    timeZone: "Asia/Kolkata",
    hour12: false,
  }),
  format = "yyyy-mm-dd h:i:s"
) => {
  const newDateTime = formatDate(format, new Date(indiaTime));
  return newDateTime;
};


const getCurrentDateAndTimeIndia = () => {
  const date = new Date();
  const indiaOffset = 5.5 * 60 * 60 * 1000; // Offset in milliseconds
  const indiaTime = new Date(date.getTime() + indiaOffset);
  return indiaTime;
};
module.exports = { getCurrentDateAndTime, getCurrentDateAndTimeIndia };
