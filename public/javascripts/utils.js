$(document).ready(function () {
    $('#crusty').change(function () {
        let crusty = $("#crusty option:selected").text()
        if (crusty !== 'Choose...') {
            filterToppingsByCrusty(crusty, function (data) {
                $('#getResultToppingsDiv ul').empty()
                $('#getResultToppingsDiv').hide()
                $.each(data, function (i, topping) {
                    let toppings = topping.toppings
                    for (let i = 0; i < toppings.length; i++) {
                        let checkbox =
                            "<div class='form-check'><input class='form-check-input' type='checkbox' value='" + toppings[i] + "' name='favorite_topping'>" +
                            "<label for='" + toppings[i] + "'>" + toppings[i] + "</label></div>"
                        $('#getResultToppingsDiv .list-group').append(checkbox + "<br>")
                    }
                });
                $("input[name='favorite_topping']").change(function () {
                    enableOrderBtn()
                });
                $('#getResultToppingsDiv').show()
                $('#size').show()
            })
        } else {
            $('#getResultToppingsDiv ul').empty()
            $('#getResultToppingsDiv').hide()
            $('#size').hide()
        }
    })

    $("input[name='size']").change(function () {
        $('#quantity').show()
        enableOrderBtn()
    });

    function filterToppingsByCrusty(crusty, handleData) {
        $.ajax({
            type: "GET",
            url: "./pizzas/" + crusty,
            success: function (data) {
                handleData(data)
            },
            error: function (e) {
                $("#getResultToppingsDiv").html("<strong>Server error. Sorry for that! =(</strong>")
            }
        });
    }

    function enableOrderBtn() {
        let toppings = $('input[name="favorite_topping"]:checked').length
        let size = $("input[name='size']:checked").val();
        (toppings > 0 && size !== undefined) ? $('#submitBtn').prop('disabled', false) : $('#submitBtn').prop('disabled', true)
    }
})