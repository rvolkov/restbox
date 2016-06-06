#include <Ethernet.h>
#include <NewPing.h>

// uncomment it to have logging to serial console
//#define SERIALCON  1

char boxname[] = "b1";          // name of this controller
//char boxname[] = "b2";          // name of this controller
char secret[] = "cisco";    // password for main controller
char server[] = "yourserver.herokuapp.com";
int port = 80;

// fallback server and IP if DHCP failed
IPAddress ipad(1,1,2,2);

// usonic module
#define TRIGGER_PIN  8  // Arduino pin tied to trigger pin on the ultrasonic sensor.
#define ECHO_PIN     9  // Arduino pin tied to echo pin on the ultrasonic sensor.
#define MAX_DISTANCE 151 // Maximum distance we want to ping for (in centimeters). Maximum sensor distance is rated at 400-500cm.
NewPing sonar(TRIGGER_PIN, ECHO_PIN, MAX_DISTANCE); // NewPing setup of pins and maximum distance.
char usonic_type[] = "usonic";
char usonic_id[] = "0";
unsigned int distance = 0;
unsigned int distancecount = 0;

// redbutton module
#define REDBUTTON_PIN 2
char redbutton_type[] = "button";
char redbutton_id[] = "0";
bool need_to_send_redbutton = false;
int redbutton_status = 0;
unsigned int redbutton_count = 5;

// switch module
#define SWITCH_PIN    3
char switch_type[] = "switch";
char switch_id[] = "0";
bool need_to_send_switch = false;
int switch_status = 0;
unsigned int switch_count = 5;

// led module
#define LED1_PIN      5
char led1_type[] = "led";
char led1_id[] = "0";
int led1_status = 0;
unsigned int led1count = 5;

// led module
#define LED2_PIN      6
char led2_type[] = "led";
char led2_id[] = "1";
int led2_status = 0;
unsigned int led2count = 5;

byte mac[] = {0x1f, 0x1f, 0x1f, 0x1f, 0x1f, 0x1f};
EthernetClient client;

void sendPUT(char *type, char *id, unsigned int value) {
#ifdef SERIALCON
    Serial.println("sendPUT");
#endif
   client.setTimeout(5000);
   if(client.connect(server, port)) {
#ifdef SERIALCON
      Serial.println(String("connect to ")+server+" and "+port);
      if(client.connected()) Serial.println("client.connected is ok");
#endif
      String str1 = String("PUT /api/put/")+boxname+"/"+secret+"/"+type+"/"+id+"/"+value+" HTTP/1.0";
      if(client.connected()) client.println(str1);
      String str2 = String("Host: ")+server;
      if(client.connected()) client.println(str2);
      if(client.connected()) client.println("Connection: close");
      if(client.connected()) client.println();
#ifdef SERIALCON
      Serial.println("data sent");
#endif
      while(client.connected()) {
        if(!client.available()) {
          delay(1000);
          if(!client.connected()) break;
          if(!client.available()) break;
        }
        if(client.available() && client.connected()) {
           char ch = client.read();
           if (ch== -1) break;
        }
      }
#ifdef SERIALCON
      Serial.println("close connection");
#endif
      client.stop();  // close the connection
#ifdef SERIALCON
      Serial.println("connection closed");
#endif
   }
}

int sendGET(char *type, char *id) {
   client.setTimeout(5000);
   if(client.connect(server, port)) {
      String response = "";
      String str1 = String("GET /api/get/")+boxname+"/"+secret+"/"+type+"/"+id+" HTTP/1.0";
      if(client.connected()) client.println(str1);
      String str2 = String("Host: ")+server;
      if(client.connected()) client.println(str2);
      if(client.connected()) client.println("Connection: close");
      if(client.connected()) client.println();
      // read the server response
#ifdef SERIALCON
      Serial.println("sendGET prepare to read");
#endif
      bool begin = false;
      while(client.connected()) {
        if(!client.available()) {
           delay(1000);
           if(!client.connected()) break;
           if(!client.available()) break;
        }
        if(client.available() && client.connected()) {
            char ch = client.read();
            if(ch == -1) break;  
            if(ch == '{') {
              begin = true;
            }
            if(begin) response += (ch);
            if(ch == '}') break;
            //Serial.write(response);
        }
      }
#ifdef SERIALCON
      Serial.println("sendGET before client.stop");
#endif
      client.stop();  // close the connection
      int start = response.indexOf(":")+1;
      String msg = response.substring(start);
      response = "";
      return msg.toInt();
   } 
   return 0;
}

void setup() {
  delay(8000);
#ifdef SERIALCON
  Serial.begin(9600);
  while (!Serial) {}
  Serial.println("configure ethernet");
#endif
  if(Ethernet.begin(mac) == 0) {
    Ethernet.begin(mac, ipad);
    strncpy(server,"1.1.2.1",sizeof(server));
    port = 3001;
#ifdef SERIALCON
    Serial.println("fallback ethernet configuration");
#endif
  }
#ifdef SERIALCON
  Serial.println("ethernet ok");
  Serial.print("My IP address: ");
  for (byte thisByte = 0; thisByte < 4; thisByte++) {
    // print the value of each byte of the IP address:
    Serial.print(Ethernet.localIP()[thisByte], DEC);
    Serial.print(".");
  }
  Serial.println("");
  Serial.print("Gateway IP: ");
  for (byte thisByte = 0; thisByte < 4; thisByte++) {
    // print the value of each byte of the IP address:
    Serial.print(Ethernet.gatewayIP()[thisByte], DEC);
    Serial.print(".");
  }
  Serial.println("");
  Serial.print("DNS IP: ");
  for (byte thisByte = 0; thisByte < 4; thisByte++) {
    // print the value of each byte of the IP address:
    Serial.print(Ethernet.dnsServerIP()[thisByte], DEC);
    Serial.print(".");
  }
  Serial.println("");
#endif
  pinMode(LED1_PIN, OUTPUT);
  pinMode(LED2_PIN, OUTPUT);
  digitalWrite(LED1_PIN, HIGH);
  delay(1000);
  digitalWrite(LED1_PIN, LOW);
  digitalWrite(LED2_PIN, HIGH);
  delay(1000);
  digitalWrite(LED2_PIN, LOW);
  pinMode(REDBUTTON_PIN, INPUT);
  pinMode(SWITCH_PIN, INPUT);
  // read initial switch state and send to server
  int sstate = digitalRead(SWITCH_PIN);
  if(sstate == LOW) {
    switch_status = 0;
#ifdef SERIALCON
    Serial.println("switch off");
#endif
  } else {
    switch_status = 1;
#ifdef SERIALCON
    Serial.println("switch on");
#endif
  }
  // read initial redbutton state and send to server
  int rstate = digitalRead(REDBUTTON_PIN);
  if(rstate == LOW) {
    redbutton_status = 0;
#ifdef SERIALCON
    Serial.println("redbutton off");
#endif
  } else {
    redbutton_status = 1;
#ifdef SERIALCON
    Serial.println("redbutton on");
#endif
  }
  sendPUT(switch_type,switch_id,switch_status);
  sendPUT(redbutton_type,redbutton_id,redbutton_status);
  int nl1 = sendGET(led1_type,led1_id);
  if(nl1 == 0) {
    digitalWrite(LED1_PIN, LOW);
  } else {
    digitalWrite(LED1_PIN, HIGH);
  }
  led1_status = nl1;
  int nl2 = sendGET(led2_type,led2_id);
  if(nl2 == 0) {
    digitalWrite(LED2_PIN, LOW);
  } else {
    digitalWrite(LED2_PIN, HIGH);
  }
  led2_status = nl2;
}

bool sendonce = false;
int prevdist = 0;
void loop() {
  delay(50);
  if(distancecount == 0) {
    int d = sonar.ping_cm();
    if(d == 0 || d > MAX_DISTANCE) {
      if(sendonce==false) {
        prevdist = 0;
        sendPUT(usonic_type,usonic_id,0);
      }
      sendonce = true;
    } else {
      sendonce = false;
    }
    if(!sendonce) {
#ifdef SERIALCON
      Serial.print("Ping: ");
      Serial.print(d);
      Serial.println("cm");
#endif
      if(prevdist != d && abs(prevdist - d) > 5) {
        sendPUT(usonic_type,usonic_id,d);
      }
      prevdist = d;
    }
    distancecount = 8;
  }
  distancecount--;
  // check switch once per 7 cycles
  if(switch_count == 0) {
    // read switch status
    int switchState = digitalRead(SWITCH_PIN);
    if(switchState == LOW && switch_status == 1) {
      switch_status = 0;
      need_to_send_switch = true;
#ifdef SERIALCON
      Serial.println("switch off");
#endif
    } 
    if(switchState == HIGH && switch_status == 0){
      switch_status = 1;
      need_to_send_switch = true;
#ifdef SERIALCON
      Serial.println("switch on");
#endif
    }
    // send switch status
    if(need_to_send_switch) {
      sendPUT(switch_type,switch_id,switch_status);
      need_to_send_switch = false;
    }
    switch_count = 7;
  }
  switch_count--;
  // check redbutton once per 6 cycles
  if(redbutton_count == 0) {
    // read red button status
    int redbuttonState = digitalRead(REDBUTTON_PIN);
    if(redbuttonState == LOW && redbutton_status == 1) {
#ifdef SERIALCON
      Serial.println("redbutton off");
#endif
      redbutton_status = 0;
      need_to_send_redbutton = true;
    } 
    if(redbuttonState == HIGH && redbutton_status == 0){
#ifdef SERIALCON
      Serial.println("redbutton on");
#endif
      redbutton_status = 1;
      need_to_send_redbutton = true;
    }
    // send red button status
    if(need_to_send_redbutton) {
      sendPUT(redbutton_type,redbutton_id,redbutton_status);
      need_to_send_redbutton = false;
    }
    redbutton_count = 6;
  }
  redbutton_count--;
  // ask led1 status once per 10 cycles
  if(led1count == 0) {
    int nl1 = sendGET(led1_type,led1_id);
    if(nl1 != led1_status) {
      if(nl1 == 0) {
        digitalWrite(LED1_PIN, LOW);
      } else {
        digitalWrite(LED1_PIN, HIGH);
      }
      led1_status = nl1;
    }
    led1count = 10;
  }
  led1count--;
  // ask led2 status once per 9 cycles
  if(led2count == 0) {
    int nl2 = sendGET(led2_type,led2_id);
    if(nl2 != led2_status) {
      if(nl2 == 0) {
        digitalWrite(LED2_PIN, LOW);
      } else {
        digitalWrite(LED2_PIN, HIGH);
      }
      led2_status = nl2;
    }
    led2count = 9;
  }
  led2count--;
}
