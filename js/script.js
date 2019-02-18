/**
 * Created by Silverdaymon on 06/12/2016.
 *  email silverdaymon@gmail.com
 */

$(function() {
    function getMagnetLink(){
        var block = $("div.downloadButtonGroup").find("div[data-sc-params]").attr("data-sc-params");
        if (block !== undefined) {
            return JSON.parse(block.replace(/'/g, '"'));
        } else {
            var script = $("footer ~ script").first()[0];
            if (script.text !== undefined) {
                var text = script.text;
                var regExp = /sc\('addGlobal'/g;
                if (regExp.test(text)) {
                    var data = jsonConvert(text);                // data contain a lot of other informations like the hash ...
                    var magnet = data.tmagnet;
                    if (magnet !== undefined) {
                        data.magnet = decodeURIComponent(magnet);
                        return data;
                    }
                }
            }
            return undefined;
        }
    }
    function enableIcon () {
        chrome.runtime.sendMessage({
            msg: "gotIt"
        });
    }
    function disableIcon () {
        chrome.runtime.sendMessage({
            msg: "notThinkFound"
        });
    }
    function testLink(params) {
        var magnetLink = params.magnet;
        if (magnetLink !== undefined) {
            enableIcon();
            chrome.runtime.onMessage.addListener( function (message, sender, response) {
                if (message.msg === "send the link") {
                    response({
                        magnet: magnetLink
                    });
                }
            });
        } else {
            disableIcon();
        }
    }
    function jsonConvert (text) {
        var array1 = [/sc\('addGlobal', /g, /,/g, /\);/g, /\s/g, /^'/g, /,$/g, /'/g];
        var array2 = ["", ": ", ",", "", "{'", "}", "\""];
        for (var i = 0; i < (array1.length); i++) {
            text = text.replace(array1[i], array2[i]);
        }
        return JSON.parse(text);
    }
    var magnetLink = getMagnetLink();
    if (magnetLink !== undefined) {
        testLink(magnetLink);
    }
});
