(function() {
  Array.prototype.forEach.call(
    document.querySelectorAll("form input[type=password]"),
    function(pass) {
      var form = pass.closest("form");

      var users = Array.prototype.filter.call(
        form.querySelectorAll("input"),
        function(input) {
          return input.type == "text" || input.type == "email";
        }
      );

      function getPos(el) {
        // yay readability
        for (
          var lx = 0, ly = 0;
          el != null;
          lx += el.offsetLeft, ly += el.offsetTop, el = el.offsetParent
        );
        return { x: lx, y: ly };
      }

      if (users.length == 1) {
        var user = users[0];

        // code for popup inside website
        var button = document.createElement("button");
        button.innerText = "🛡";
        var positionFeilds = getPos(user);
        var topButton = positionFeilds.y + user.offsetHeight / 6;
        var leftButton = positionFeilds.x + user.offsetWidth - 50;
        button.style.cssText =
          "position:fixed;top:" +
          topButton +
          "px;left:" +
          leftButton +
          "px;display:block; z-index:1000;border: none;background-image: none;background-color: Transparent;";

        button.addEventListener(
          "click",
          function() {
            var frame = document.getElementById("safeguardIframe");
            if (frame) {
              frame.remove();
            } else {
              console.log("hmm");
              var topPopupIframe = positionFeilds.y + user.offsetHeight + 2;
              var leftPopupIframe = positionFeilds.x;

              var iframeWidth = user.offsetWidth > 300 ? user.offsetWidth : 300;

              var iframe = document.createElement("iframe");
              iframe.id = "safeguardIframe";
              iframe.src = "http://127.0.0.1:3000/" + location.host;
              iframe.style.cssText =
                "position:fixed;top:" +
                topPopupIframe +
                "px;left:" +
                leftPopupIframe +
                "px;display:block;" +
                "width:" +
                iframeWidth +
                "px;height:300px;z-index:1000;";
              document.body.appendChild(iframe);
            }
          },
          false
        );

        document.body.appendChild(button);

        var eventMethod = window.addEventListener
          ? "addEventListener"
          : "attachEvent";
        var eventer = window[eventMethod];
        var messageEvent =
          eventMethod === "attachEvent" ? "onmessage" : "message";
        eventer(messageEvent, function(e) {
          // if (e.origin !== 'http://the-trusted-iframe-origin.com') return;
          // if (e.data === "myevent" || e.message === "myevent")
          var data = e.data;
          if (data.app === "safeguard-web") {
            user.value = data.username;
            pass.value = data.password;

            user.style.backgroundColor = "#edffe3";
            pass.style.backgroundColor = "#edffe3";
          }
        });

        // code for popup inside website ends

        // code for popup.html injection

        chrome.runtime.onMessage.addListener(function(
          message,
          sender,
          respond
        ) {
          if (message.from == "popup") {
            if (message.action == "do_fill") {
              console.log("message recived");
              user.value = message.user;
              pass.value = message.pass;

              user.style.backgroundColor = "#edffe3";
              pass.style.backgroundColor = "#edffe3";
            }
          }
        });
        // code for popup.html injection ends

        chrome.runtime.sendMessage("", {
          from: "content_script",
          action: "fill_available"
        });
      }
    }
  );
})();
