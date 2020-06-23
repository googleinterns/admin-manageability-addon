// get the title and from Time from the timeFilter value
function getTitleandTime(timeFilter) {
  var toTime = new Date();
  var millisInBetween;
  var title;
  if(timeFilter == "EVERY_HOUR") { 
    millisInBetween = 60*60*1000;
    title = "hour";
  } else if(timeFilter == "EVERY_6_HOUR") {
    millisInBetween = 6*60*60*1000;
    title = "6 hours";
  } else if(timeFilter == "EVERY_24_HOUR") {
    millisInBetween = 24*60*60*1000;
    title = "24 hours";
  } else if(timeFilter == "EVERY_7_DAYS") {
    millisInBetween = 7*24*60*60*1000;
    title = "7 days";
  } else {
    millisInBetween = 30*24*60*60*1000;
    title = "30 days";
  }
  var fromTime = new Date(toTime.getTime() - millisInBetween);
  fromTime = Utilities.formatDate(fromTime, 'Etc/GMT', 'yyyy-MM-dd\'T\'HH:mm:ss.SSS\'Z\'');  
  return {"FromTime" : fromTime, "title" : title};
}
