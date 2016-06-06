# RESTbox
## platform for quick and easy prototyping of IoT devices for demos, shows, presentations

## introduction
RESTbox is a platform to easy build IoT devices for presentations and demos during conferences and meetings. If you need to show any product which is possible to control via network, for example, Cisco router, you can build IoT device to change Cisco router configuration from events, generated by sensors of this IoT device, for example, you wish to change network performance by moving your hand in front of ultrasonic distance sensor.

## user’s perspective
Need to have easy-to-build prototyping platform where people will be able to build IoT devices without soldering for use during presentations, demos and shows.
Typical use case should be the next:
* select needed actions during the presentation, for example, hands movement, changes in environment, buttons and switches should generate events on the server software to apply changes to different equipment
* select needed actions, for example some events during demo should change actuators state, for example, highlight LEDs
* select needed boxes with sensors and actuators
* connect boxes to the controller box easily
* join all the parts in solid structure, because presentation and demo equipment should travel to long distances
* events from sensors, buttons and switches should be translated to a middleware software platform, which is able to to join it to the calls to external APIs, like equipment API or Twitter API
* Middleware software should be able to initiate change in actuators
* Need to be able to receive power from different types of sources

## designer’s perspective
We have next requirements:
* easy to use parts, so controller and sensors and actuators should be inside nice boxes
* solid basement - need to use something standard and widely used for mechanical part to join boxes together
* no soldering - need to use connectors
* flexible software on controller, tested and easy to support different types of boxes
* should be able to work with network, so Ethernet
* power requirements - need to be able to power from Power over Ethernet, USB and external power source
* as for presentation equipment, protocol should be easy to analyze, something based on HTTP
* middleware should use popular platform as well as be easy extendable and configurable

## requirements
We need to have selection of parts, which should include distance sensor, LEDs and different types of buttons and switches in the first stage and expandable to more sensors and actuators later.  Customer will select needed sensors and actuators and should be able to build IoT device without soldering, use mechanical and electrical connectors. Software for controller should have modular design to easy define installed modules. It should be connected to the network by Ethernet, use DHCP to configure IP and DNS and use DNS server name. It should work with server by HTTP-based interface to ask about actuators states and use HTTP POST calls to send changes into sensor states. Server part should be expandable to let customer add own code to work with external systems when events from IoT device are received.

## mechanical Design
* Option 1: development board and all the parts connected to it
  *	Props: easy to change
  *	Cons: it is impossible to use it if device should travel to long distances
* Option 2: plastic boxes with parts (controller, actuator, sensor) interconnected with wires
  *	Props: simple, light
  *	Cons: will not survive during long travels to conferences
* Option 3: plastic boxes, connected to DIN rail
  *	Props: Uses standard mechanical parts, widely available
  *	Cons: heavy and big
* Choice: Select option 3 as I need to use widely available parts and solution should be solid to travel often to a long distances

![RESTbox DIN rail base image]
(restbox/img/din-rail.jpg)

## electric connectors
I selected cheapest and simplest wires and connectors, use 3 wires – GND, +5V, pin

![RESTbox connector image]
(restbox/img/din-rail-connector.jpg)

## microcontroller
* Option 1: Arduino
  * Props: cheap, 5V on pins, cheap power over Ethernet module
  *	Cons: low performance, low-level programming
![RESTbox arduino image]
(restbox/img/controller-wiring.jpg)
* Option 2: Raspberry PI
 *	Props: high performance, high level programming language
 *	Cons: No integrated Power over Ethernet, 3.3V on pins (not suitable for available sensors)

 ![RESTbox rpi image]
 (restbox/img/rpi.jpg)

 * Choice: Power over Ethernet is important, also 5V output on pins is important for this project. Performance is not important.  Low-level or high-level programming language is not important, as all the logic will be into external  program. So I select Arduino + Ethernet shield + PoE module.
* RPI version - for the future

## network connection
* Option 1: Ethernet
  *	Props: widely available, PoE
  *	Cons: wires is not useful in some cases
* Option 2: WiFi
  *	Props: no wires
  *	Cons: no option to transfer power, more expensive parts

* Choice: Wired Ethernet, usually wired Ethernet widely available, also I suspect to use IoT device with PoE-enabled Ethernet switch.

## sensors
I don’t have any options here except button, switch and ultrasonic distance meter.

## actuators
No any options for now, only LED lights

![RESTbox rpi image]
(restbox/img/led-module.jpg)

## project initial picture

![RESTbox rpi image]
(restbox/img/restbox-dev.jpg)

## project devices picture

![RESTbox rpi image]
(restbox/img/restbox-2.png)
