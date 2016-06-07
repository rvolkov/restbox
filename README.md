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
(https://raw.githubusercontent.com/rvolkov/restbox/master/img/din-rail.jpg)

## electric connectors
I selected cheapest and simplest wires and connectors, use 3 wires – GND, +5V, pin

![RESTbox connector image]
(https://raw.githubusercontent.com/rvolkov/restbox/master/img/din-rail-connector.jpg)

## microcontroller
* Option 1: Arduino
  * Props: cheap, 5V on pins, cheap power over Ethernet module
  *	Cons: low performance, low-level programming

![RESTbox arduino image]
(https://raw.githubusercontent.com/rvolkov/restbox/master/img/controller-wiring.jpg)

* Option 2: Raspberry PI
 *	Props: high performance, high level programming language
 *	Cons: No integrated Power over Ethernet, 3.3V on pins (not suitable for available sensors)

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
(https://raw.githubusercontent.com/rvolkov/restbox/master/img/led-module.jpg)

## project initial picture

![RESTbox rpi image]
(https://raw.githubusercontent.com/rvolkov/restbox/master/img/restbox-dev.jpg)

## project devices picture

![RESTbox rpi image]
(https://raw.githubusercontent.com/rvolkov/restbox/master/img/restbox-2.png)

## server part
Should be able to accept HTTP requests from RESTbox and show results. Also users should be able to control actuators from Web interface. In the future users should be able to add code to integrate server to work with own devices (like routers or other equipment).
Server software should be easily hosted on popular PaaS platforms, Node.js has best support, so server software will be developed on Node.js

## Test Procedure Description
### Components Testing
*	Install software to controller, check that no errors during compilation
*	Connect controller to the PoE Ethernet switch, check that PoE board powered controller up
*	Look into console messages from controller to see DHCP IP address assignment
*	Look into console messages from controller to see HTTP GET successful to the external server
*	Connect mount board with button, check that button press generates debug message on console
*	Connect mount board with distance sensor and check that we can see debug messages in case of changes on sensor
*	Connect mount board with LED and check that LED is switching on and off
### Integration Testing
Arduino pins:
*	2&3 for ultrasound distance sensor
*	4 for red LED
*	5 for green LED
*	6 for big red button
*	7 for switch

Controller was connected to Cisco3650-PoE switch with Ethernet, this switch was connected to Cisco Router as DHCP server and to the laptop with RESTbox server software. Controller software was coded to connect to the notebook IP address.

Next tests:
*	press Big Red Button, check that HTTP POST was sent to the server
*	enable switch, check that HTTP POST was sent to the server
*	disable switch, check that HTTP POST was sent to the server
*	insert hand into distance sensor area of work  and check that HTTP POST was sent to the server
*	check that controller send HTTP GETs every 5 seconds to the server to ask for LED status
*	change server configuration to answer on HTTP GETs for LEDs and check that LEDs changed state (from off to on and from on to off)

![RESTbox in work]
(https://raw.githubusercontent.com/rvolkov/restbox/master/img/restbox-test.jpg)

## hardware parts
### arduino controller
![arduino]
(https://raw.githubusercontent.com/rvolkov/restbox/master/img/arduino.jpg)

### ethernet shield
![ethernet]
(https://raw.githubusercontent.com/rvolkov/restbox/master/img/ethernet.jpg)

### PoE module
![poe1]
(https://raw.githubusercontent.com/rvolkov/restbox/master/img/poe1.jpg)
![poe2]
(https://raw.githubusercontent.com/rvolkov/restbox/master/img/poe2.jpg)

### switch
![switch]
(https://raw.githubusercontent.com/rvolkov/restbox/master/img/switch.jpg)

### ultrasonic sensor
![ultrasonic]
(https://raw.githubusercontent.com/rvolkov/restbox/master/img/ultrasonic.jpg)

### controller with boards
![build1]
(https://raw.githubusercontent.com/rvolkov/restbox/master/img/build1.jpg)
![build2]
(https://raw.githubusercontent.com/rvolkov/restbox/master/img/build2.jpg)
![build3]
(https://raw.githubusercontent.com/rvolkov/restbox/master/img/build3.jpg)

## Arduino scetch

## RESTbox server controller
Node.js, you can host it on heroku.com, also you can pack application into Docker container. Before run - edit app_node/config.js. It supports Cisco CSR1000v devices.
