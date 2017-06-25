var users;
var filteredUsersJson = [];
var userCredentials;
var pageModel = {
    addRoles: {
        buttonName: "ADD ROLES",
        operationName: "addRoles",
        successMsg: "The chosen roles were successfully added to specified users."
    },
    removeRoles: {
        buttonName: "REMOVE ROLES",
        operationName: "removeRoles",
        successMsg: "The chosen roles were successfully removed from specified users."
    },
    editRoles: {
        buttonName: "EDIT ROLES",
        operationName: "editRoles",
        successMsg: "The chosen roles were successfully edited for specified users."
    }
}

function getCurrentPageModel() {

    return pageModel[$("li.tabs.active").data("model")];
}


function performPerfectoUserApiOperation(operationName, userIdsArr, params, callback) {
    var queryParams = {};
    queryParams.userIds = userIdsArr;
    queryParams.params = params;
    queryParams.authToken = userCredentials;

    var url = `https://qzv29xf1e2.execute-api.us-east-1.amazonaws.com/prod/func1/${operationName}`;
    $.post(url, JSON.stringify(queryParams), function (response, status) {
        callback(response, null); // success
    }).fail(function (e) {
        callback(null, e); //failure
    });
}


function getUsersList(host, user, password, callback) {

    var authParams = {
        host: host,
        user: user,
        password: password
    };

    performPerfectoUserApiOperation("authenticate", null, authParams, function (response, error) {
        if (!error) {
            users = response.users;
            createUserListUI(users);
            userCredentials = response.authToken;
        }
        callback(error);
    });

// var url = "https://qzv29xf1e2.execute-api.us-east-1.amazonaws.com/prod/func1/list";
// $.post(url, JSON.stringify(userCredentials), function(response, status) {
//     users = response.users;
//     createUserListUI(users);
//     callback(null);
// }).fail(function(e) {
//     callback(e);
// });
}

function performRolesOperations(operationName, userIdsArr, rolesArr, callback) {

    performPerfectoUserApiOperation(operationName, userIdsArr, {roles: rolesArr}, callback);

}

function createUserListUI(dataUserList) {

    var userList = $("#user-list");
    userList.empty();

    for (var i = dataUserList.length - 1; i >= 0; i--) {
        var user = dataUserList[i];
        userList.append($("<li>").addClass("list-group-item").text(user.username).data("userName", user.username));
    }
    userList.css("height", "400px");
    userList.css("width", "49%");
    userList.css("overflow-y", "auto");
    userList.css("float", "left");

    addCheckboxes();
}

function createFilteredUserListUI(dataFilteredList) {

    var filteredUserListElement = $("#filtered-user-list");
    filteredUserListElement.empty();

    dataFilteredList.each(function () {
        filteredUserListElement.append($("<li>").addClass("list-group-item").text($(this).text()).data("userName", $(this).data("userName")));
    })

    addRemoveButtons();

    filteredUserListElement.css("height", "400px");
    filteredUserListElement.css("width", "48%");
    filteredUserListElement.css("overflow-y", "auto");
    filteredUserListElement.css("float", "right");

}

function createFilteredUserListJSON(dataFilteredList) {

    dataFilteredList.each(function () {
        var filteredElement = $(this).data("userName");
        for (var i = users.length - 1; i >= 0; i--) {
            var user = users[i];
            if (user["username"] === filteredElement) {
                var newUser = {
                    username: user["username"],
                    roles: user["roles"]
                };
                filteredUsersJson.push(newUser);
                break;
            }
        }
    })
}


function addCheckboxes() {

    $('.list-group.checked-list-box .list-group-item').each(function () {

        // Settings
        var $widget = $(this),
            $checkbox = $('<input type="checkbox" class="hidden" />'),
            color = ($widget.data('color') ? $widget.data('color') : "primary"),
            style = ($widget.data('style') == "button" ? "btn-" : "list-group-item-"),
            settings = {
                on: {
                    icon: 'glyphicon glyphicon-check'
                },
                off: {
                    icon: 'glyphicon glyphicon-unchecked'
                }
            };

        $widget.css('cursor', 'pointer')
        $widget.data("userName", $(this).data("userName"));
        $widget.append($checkbox);

        // Event Handlers
        $widget.on('click', function () {
            $checkbox.prop('checked', !$checkbox.is(':checked'));
            $checkbox.triggerHandler('change');
            console.log($widget.data("userName"));
            updateDisplay();
        });
        $checkbox.on('change', function () {
            updateDisplay();
        });


        $("#checkAll").on('click', function () {
            $(".check").prop('checked', $(this).prop('checked'));
            $checkbox.prop('checked', $("#checkAll").is(':checked'));
            $checkbox.triggerHandler('change');
            updateDisplay();

        });


        // Actions
        function updateDisplay() {
            var isChecked = $checkbox.is(':checked');

            // Set the button's state
            $widget.data('state', (isChecked) ? "on" : "off");

            // Set the button's icon
            $widget.find('.state-icon')
                .removeClass()
                .addClass('state-icon ' + settings[$widget.data('state')].icon);

            // Update the button's color
            if (isChecked) {
                $widget.addClass(style + color + ' active');
            } else {
                $widget.removeClass(style + color + ' active');
            }
        }

        // Initialization
        function init() {

            if ($widget.data('checked') == true) {
                $checkbox.prop('checked', !$checkbox.is(':checked'));
            }

            updateDisplay();

            // Inject the icon if applicable
            if ($widget.find('.state-icon').length == 0) {
                $widget.prepend('<span class="state-icon ' + settings[$widget.data('state')].icon + '"></span> ');
            }
        }

        init();
    });
}


function addRemoveButtons() {

    $("#filtered-user-list li").each(function () {
        var widget = $(this);
        var removeBtn = $("<span class='glyphicon glyphicon-remove'/>").css("float", "left").css("font-size", "1em");
        widget.append(removeBtn);

        $("span.glyphicon.glyphicon-remove").click(function () {
            var data = $(this).parent().data("userName");
            $(this).parent().remove();
            $(".list-group-item.list-group-item-primary.active").each(function () {
                if ($(this).data("userName") == data) {
                    $(this).click();
                }
            })
        })

    })
}


function validateLoginForm() {
    var isValid = true;
    $('.form-control.login-input').each(function () {
        if ($(this).val() === '')
            isValid = false;
        console.log(isValid);
    });
    return isValid;
}

function resetUserListUI() {

    $('#user-filter-dropdown').text("Filer Users By");
    $('#user-filter-input').val("");
    createUserListUI(users);
    $("#checkAll").prop('checked', false);

}

function resetFilteredUserListUI() {

    $("#filtered-user-list").empty();
}


function resetRolesPanelUI() {

    $(".roles input[type=checkbox]:checked").each(function () {
        $(this).prop("checked", false);
        $("#user-defined-roles-input").val("");
    })

}

function exportJson(el) {

    var data = "text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(filteredUsersJson));

    el.attr("href", "data:" + data);
    el.attr("download", "data.json");
}


$(document).ready(function () {

    $('#exportJSON').click(function () {
        exportJson($(this));
    })

// $('#user-defined-roles-input').click(function() {
//     if ($(this).val() == "Please insert comma separated list of EXISTING roles in your lab") {
//         $(this).val("");
//     }
// });

// $('#user-defined-roles-input').focusout(function() {
//     if($(this).val()=="") {
//         $(this).val("Please insert comma separated list of EXISTING roles in your lab");
//     }
// })


    $('.user-filter-option').click(function () {
        var clickedElement = $(this);
        $('#user-filter-dropdown').text(clickedElement.text()).data("filter-key", clickedElement.data("filter-key"));
    });

//    $('#user-filter-input').click(function() {
//        if ($(this).val() == "Please Mind Casing") {
//            $(this).val("");
//        }
//    });

//    $('#user-filter-input').focusout(function() {

//        if ($(this).val()=="") {
//         $(this).val("Please Mind Casing");
//     }
// });

    $('#user-filter-btn').click(function () {

        var filterKey = $('#user-filter-dropdown').data("filter-key");
        var filterValue = $('#user-filter-input').val();

        var filteredUserList = [];
        var filterValueAsArray = filterValue.split(/,\s*/);

        for (var i = users.length - 1; i >= 0; i--) {
            var user = users[i];

            if (filterKey == 'groups') {

                if (user['groups'].length > 0) {
                    for (var j = user[filterKey].length - 1; j >= 0; j--) {

                        if (filterValueAsArray.indexOf(user[filterKey][j].label) > -1) {
                            filteredUserList.push(user);
                        }
                    }

                }


            }

            else {
                if (user[filterKey]) {
                    filterValueAsArray.forEach(function (currentVal) {
                        console.log("current val: " + currentVal);
                        console.log(user[filterKey]);
                        if (user[filterKey].includes(currentVal)) {
                            filteredUserList.push(user);
                            console.log("filteredUserList length: " + filteredUserList.length);
                        }

                    })
                }
            }

        }
        createUserListUI(filteredUserList);
        $("#checkAll").prop('checked', false);


    });

    $('#user-filter-clear-btn').click(function () {

        resetUserListUI();
        resetFilteredUserListUI();
    });


    $("#go-btn").click(function () {

        var filteredList = $('.list-group.checked-list-box .list-group-item.list-group-item-primary.active');
        createFilteredUserListUI(filteredList);
        createFilteredUserListJSON(filteredList);
    })


    $("#sign-in-btn").click(function () {

        if (validateLoginForm() === true) {

            var host = $("#cloud-input").val(),
                user = $("#username-input").val(),
                password = $("#password-input").val();


            var btn = $(this);
            btn.button('loading');

            getUsersList(host, user, password, function (error) {

                if (!error) {
                    $("#sign-in-page").hide();
                    // $("#choose-operation-page").show();
                    $("#add-roles-page").show();
                }

                else {
                    btn.button('reset');

                    $(".not-admin-alert").text("ERROR: " + error.responseJSON.errorMessage).show();
                    $(".not-admin-alert").fadeTo(2000, 500).slideUp(500, function () {
                        $(".not-admin-alert").slideUp(500);
                    });

                }
            });

        }

    })


    $("#add-roles-go-btn").click(function () {

        var model = getCurrentPageModel().buttonName.toLowerCase();

        if (confirm('Are you sure you want to ' + model + '?')) {

            // var filteredList = $('.list-group.checked-list-box .list-group-item.list-group-item-primary.active');
            var filteredList = $("#filtered-user-list li");
            var filteredUserListIds = [];
            var currentModel = getCurrentPageModel();

            filteredList.each(function () {
                filteredUserListIds.push($(this).data("userName"));
            });

            var rolesListChecked = $(".roles input[type=checkbox]:checked");
            var customizedRolesInput = $("#user-defined-roles-input").val();
            var rolesList = [];

            rolesListChecked.map(function () {

                rolesList.push($(this).next("label").text().split(' '));
            })

            console.log("system roles checked: " + rolesList);

            if (customizedRolesInput != "") {
                rolesList = rolesList.concat(customizedRolesInput.split(/,\s*/));
            }

            performRolesOperations(currentModel.operationName, filteredUserListIds, rolesList, function (response, error) {
                if (!error) {
                    $("#add-roles-status-img").attr("class", "glyphicon glyphicon-ok").css("color", "#22f522");
                    $(".modal-title").text("Thank You!").css('color', 'black');
                    $("#add-roles-status-text").text(currentModel.successMsg);

                    $('#add-roles-success-modal').modal('show');
                    // $("#add-roles-success-alert").show();
                    // $("#add-roles-success-alert").fadeTo(2000, 500).slideUp(500, function(){
                    //     $("#add-roles-success-alert").slideUp(500);
                    // });
                }
                else {
                    $("#add-roles-status-img").attr("class", "glyphicon glyphicon-remove").css("color", "red");

                    $(".modal-title").text("ERROR").css('color', 'red');
                    $("#add-roles-status-text").text(error.responseJSON.errorMessage);

                    $('#add-roles-success-modal').modal('show');

                    // $(".alert alert-success").text("ERROR: " + error.responseJSON.errorMessage).show();
                    // $(".alert alert-success").fadeTo(2000, 500).slideUp(500, function(){
                    //     $(".alert alert-success").slideUp(500);
                    // })
                }
            })
        }

    })
    $(".tabs").click(function (e) {

        e.preventDefault();
        $(this).tab('show');

        var model = getCurrentPageModel();

        if (model.operationName === "editRoles") {
            $('#exportJSON').show();
            $('#roles-panel').hide();
        }
        $("#add-roles-go-btn").text(model.buttonName);
        resetUserListUI();
        resetFilteredUserListUI();
        resetRolesPanelUI();
    })


});


