import React, { useState } from "react";
import icon from "../../img/icon-128.png";
import { hot } from "react-hot-loader";

function extractHostname(url) {
  var hostname;
  //find & remove protocol (http, ftp, etc.) and get hostname

  if (url.indexOf("//") > -1) {
    hostname = url.split("/")[2];
  } else {
    hostname = url.split("/")[0];
  }

  //find & remove port number
  hostname = hostname.split(":")[0];
  //find & remove "?"
  hostname = hostname.split("?")[0];
  hostname = hostname.split("www.")[1];

  return hostname;
}

function injectPassword(url, user, password) {
  chrome.tabs.getSelected(function(tab) {
    console.log("SEND: message to " + tab.id);
    chrome.tabs.sendMessage(tab.id, {
      from: "popup",
      action: "do_fill",
      url: url,
      user: user,
      pass: password
    });
  });
}

function GreetingComponent() {
  const [domain, setDomain] = useState("https://safeguard.icu/");

  var eventMethod = window.addEventListener
    ? "addEventListener"
    : "attachEvent";
  var eventer = window[eventMethod];
  var messageEvent = eventMethod === "attachEvent" ? "onmessage" : "message";
  eventer(messageEvent, function(e) {
    // if (e.origin !== 'http://the-trusted-iframe-origin.com') return;
    // if (e.data === "myevent" || e.message === "myevent")
    var data = e.data;
    if (data.app === "safeguard-web")
      injectPassword(data.url, data.username, data.password);
    if (data.open === "true")
      chrome.tabs.create({ url: "https://safeguard.icu/" });
  });

  chrome.tabs.getSelected(function(tab) {
    var url = new URL(tab.url);
    if (
      tab.url.indexOf("https://chrome.google.com") != 0 &&
      tab.url.indexOf("chrome://") != 0
    )
      setDomain("https://safeguard.icu/" + url.host);
  });

  return (
    <div>
      <iframe
        frameBorder="0"
        height="450px"
        width="350px"
        src={domain}
      ></iframe>
    </div>
  );
}

export default hot(module)(GreetingComponent);
