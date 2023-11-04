let days = (function () {
    return {
        getDays: function () {
            function datediff(first, second) {
                return Math.round((second - first) / (1000 * 60 * 60 * 24));
            }

            return datediff(new Date('2022-2-24'), new Date)
        }
    }
}());

module.exports = days;



