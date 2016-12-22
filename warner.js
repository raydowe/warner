var Warner = new function()
{

  const light = require('./light.js');
  const logger = require('./logger.js');
  const bluetooth = require('node-bluetooth');
  const readline = require('readline');
  const os = require('os');
  const util = require('util')
  const child_process = require('child_process');

  const LIGHT_FADE_SPEED = 500;
  const SCAN_DELAY_WIFI = 1000;
  const SCAN_DELAY_BLUETOOTH = 1000;
  const BT_ADDRESSES = ['24:DF:6A:F3:99:28'];
  const WIFI_ADDRESSES = ['24:DF:6A:F3:87:CA']

  var ctx = this;
  var found_bt = false;
  var found_wifi = false;
  var ip_address = '0.0.0.0';
  var netmask = '255.255.255.0';
  var bluetooth_devices;


  this.Warner = function()
  {
    // show blue while data hasn't yet been gathered
    light.color(light.COLOR_BLUE);

    // listen for key commands, so we can exit gracefully
    readline.emitKeypressEvents(process.stdin);
    process.stdin.setRawMode(true);
    process.stdin.on('keypress', (str, key) => {
      if (key.ctrl && key.name === 'c')
      {
        ctx.quit();
      }
    });

    // get network details for this machine
    ctx.getNetworkDetails();

    // find wifi devices
    ctx.findWiFiDevices();

    // find bluetooth devices
    ctx.findBluetoothDevices();
  }

  this.getNetworkDetails = function()
  {
    logger.log("Getting network details");

    // get machine IP address
    'use strict';
    var ifaces = os.networkInterfaces();

    Object.keys(ifaces).forEach(function (ifname) {
      var alias = 0;

      ifaces[ifname].forEach(function (iface) {
        // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
        if ('IPv4' !== iface.family || iface.internal !== false)
        {
          return;
        }

        if (alias >= 1)
        {
          // this single interface has multiple ipv4 addresses
          logger.log("Found Interface: " + ifname + ':' + alias + ' = ' + iface.address + '/' + iface.netmask);
          ip_address = iface.address;
          netmask = iface.netmask;
        }
        else
        {
          // this interface has only one ipv4 adress
          logger.log("Found Interface: " + ifname + ' = ' + iface.address + '/' + iface.netmask);
          ip_address = iface.address;
          netmask = iface.netmask;
        }
        ++alias;
      });
    });

    // get netmask
    var netmask_pieces = netmask.split('.');
    netmask = 0;
    var netmask_binary = '';
    for (var n = 0; n < netmask_pieces.length; n++)
    {
      netmask_binary += (parseInt(netmask_pieces[n]) >>> 0).toString(2);
    }

    for(var nb = 0; nb < netmask_binary.length; nb++)
    {
      netmask += parseInt(netmask_binary.substr(nb, 1))
    }

    logger.log ('Using Netmask of /' + netmask)


    // get ip address
    var ip_pieces = ip_address.split('.');
    ip_address = '';
    for(var i = 0; i < ip_pieces.length; i++)
    {
      var joiner = (ip_address == '') ? '' : '.';
      var chunk = (i == 3) ? '0' : ip_pieces[i];
      ip_address += joiner + chunk;
    }
    logger.log("Using IP Address of " + ip_address);
  }

  this.findWiFiDevices = function()
  {
    logger.log("Scanning For WiFi Devices...");
    child_process.exec('sudo nmap -sP -n ' + ip_address + '/' + netmask, ctx.receivedWiFiResults);
  }

  this.receivedWiFiResults = function(error, stdout, stderr)
  {
    logger.log("Finished Scanning WiFi");
    found_wifi = false;
    for (var i = 0; i < WIFI_ADDRESSES.length; i++)
    {
      if (stdout.indexOf(WIFI_ADDRESSES[i] >= 0))
      {
        logger.log('Found WiFi Device ' + WIFI_ADDRESSES[i] + ' on Network');
        found_wifi = true;
      }
    }
    ctx.updateColours();

    setTimeout(ctx.findWiFiDevices, SCAN_DELAY_WIFI);
  }

  this.findBluetoothDevices = function()
  {
    logger.log("Scanning For Bluetooth Devices...");
    bluetooth_devices = new bluetooth.DeviceINQ();
    bluetooth_devices.on('finished', ctx.finishedScanningBluetooth);
    bluetooth_devices.on('found', ctx.foundBluetoothDevice);
    bluetooth_devices.inquire();
  }

  this.foundBluetoothDevice = function found(address, name)
  {
    logger.log('Found Bluetooth Device: ' + address + ' with name ' + name);
    for (var i = 0; i < BT_ADDRESSES.length; i++)
    {
      if (address.replace(new RegExp('-', 'g'), ':').toUpperCase() == BT_ADDRESSES[i])
      {
        found_bt = true;
        light.tween(light.currentColor(), light.COLOR_RED, LIGHT_FADE_SPEED);
      }
    }
  }

  this.finishedScanningBluetooth = function()
  {
    logger.log("Finished Scanning Bluetooth");
    found_bt = false;
    ctx.updateColours();
    setTimeout(ctx.findBluetoothDevices, SCAN_DELAY_BLUETOOTH);
  }

  this.updateColours = function()
  {
    if (found_bt == true)
    {
      light.tween(light.currentColor(), light.COLOR_RED, LIGHT_FADE_SPEED);
    }
    else
    {
      if (found_wifi == true)
      {
      light.tween(light.currentColor(), light.COLOR_YELLOW, LIGHT_FADE_SPEED);
      }
      else
      {
      light.tween(light.currentColor(), light.COLOR_GREEN, LIGHT_FADE_SPEED);
      }
    }
  }

  this.quit = function()
  {
    logger.log("Quiting");
    light.color(light.COLOR_OFF);
    light.close();
    process.exit();
  }

}

// run constructor and start the application
Warner.Warner();
