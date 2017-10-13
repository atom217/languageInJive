/**
 * Utils 
 */
var Utils = {

    //date formatter 
    formatDate: function(full_date, monthNamesTranslated) {

        var d = new Date(full_date);
        var day = d.getDate();
        //format day
        if (day < 10) day = '0' + day;

        return day + '/' + monthNamesTranslated[d.getMonth()] + '/' + d.getFullYear() + ' ' + d.getHours() + ':' + d.getMinutes();
    }

}