var log = console.log;
var error = console.error;

function formatConsoleDate (args) {
    var first_parameter = args[0];
    var other_parameters = Array.prototype.slice.call(args, 1);

	var date = new Date();
	var hour = date.getHours();
    var minutes = date.getMinutes();
    var seconds = date.getSeconds();
    var milliseconds = date.getMilliseconds();

    var timeStamp = '[' +
		((hour < 10) ? '0' + hour: hour) + ':' +
		((minutes < 10) ? '0' + minutes: minutes) + ':' +
		((seconds < 10) ? '0' + seconds: seconds) + '.' +
		('00' + milliseconds).slice(-3) + '] ';

	return [timeStamp + first_parameter].concat(other_parameters)
}

console.log = function () {
    log.apply(console, formatConsoleDate(arguments));
};


console.error = function () {
    error.apply(console, formatConsoleDate(arguments));
};