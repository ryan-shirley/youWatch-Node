This project aims to automate the analysis of CCTV footage from a Reolink camera system. Motion records are analysed using object detection. Detections search for people and triggers a notification when found.

Dramatically reducing the number of false positives that are created with a higher level of confidence. Automated overnight analysis even when at home. Analysis results stored in a MongoDB database with notifications sent with IFTT and slack. Object detections is carried out using the deepstack object detection API - [https://deepstack.cc/](https://deepstack.cc/)

**Feature List**

- [x]  API server
- [x]  Video analysis queue
- [x]  Computer Vision API
- [ ]  Computer vision API - GPU enabled
- [x]  Store analysis results
- [x]  Detect if family member is home
- [x]  Override home status for over night detection
- [x]  New clip watcher
- [x]  Reolink client - save motion clips
- [x]  IFTTT notification
- [x]  Slack video upload

## Criteria

What defines success for this project?

- Be able to detect people on property without human analysis
- Integrate with the Reolink camera system
- Reduce the number of false positive notifications
- Notifications are sent within short time of recording being saved
- Notifications have an image preview on mobile
- Ability to view video recording of person

## Problem

**One line:** Unaware of human activity on property unless sifting through all motion records 

The Reolink camera system is only able to detection motion based on the motion sensitivity of a certain area. It is unable to detect if this motion has been triggered by a human versus wind, rain or other objects such as pets/animals.

> Takes to much time to sift through video recordings when their are so many false positives. As a result recordings are not analysed unless aware of an incident either personally or via neighbours.

## Computer Vision:

In order to detect people in a video, computer vision analysis must be carried out in the form of **object detection**. Object detection models will be able to detect certain objects that they are trained on. The so called object that I am interested in this project is the "person" object.

By utilising object detection, the application will be able to understand with a certain degree of confidence if their is a person in a given frame. This is what is going to be used to reduce the number of false positive notifications.

In addition to object detection, other areas of custom computer vision models could be explored to provide an additional level of analysis such as face detection, detecting if a car open or closed.

## Notifications

Sending a notification in a timely manner is key for the success of this project. It is important that these notifications are able to provide as much detail to a user in a short period of time. In order to do this, the integration must be seamless and intuitive.

Notifications sent to mobile devices could be send using the **IFTTT** app which is able provide an image in addition to text in the notification without needing to open an app. This image will be key to providing insight regarding the person detection. In addition to this, **Slack** can be used to upload the full motion clip for full remote viewing. The correct slack channel can be open via the IFTTT

## Tools/technologies

In order to achieve the desired functioning project, a range of existing tools and technologies will be used in combination to server the project.

### 3rd Party Tools

- IFTTT (notifications) - [https://ifttt.com/](https://ifttt.com/)
- Dropbox (image hosting for notifications) - [https://www.dropbox.com/](https://www.dropbox.com/)
- Slack (video hosting) - [https://slack.com/intl/en-ie/](https://slack.com/intl/en-ie/)
- Deep Stack (Computer vision API) - [https://deepstack.cc/](https://deepstack.cc/)
- Reolink Client - [https://reolink.com/](https://reolink.com/)

### Technologies

- Express.js
- Bull (Node queue system based on redis)
- Bull Board (Bull queue visualisation interface)
- Redis
- MongoDB
- FFmpeg
- Canvas
- Docker

## To Do

**Server**

- [x]  Setup express.js project architecture
- [x]  Setup bull queue
- [x]  Setup bull board UI
- [x]  Setup MongoDB
- [x]  Setup initial MongoDB models & DAO
- [x]  Generate frames from video based of settings
- [x]  Delete generated frames after analysis
- [ ]  Refactor saving results into DB into "videoQueue.on("completed")" - access job details such as time taken, start time, end time etc.
- [ ]  Ensure required folders are created on server start
- [x]  Delete input video used for detection
- [ ]  Delete input video folders that are empty (daily recurring job)
- [x]  Wrap application using Docker
- [x]  Publish to Dockerhub
- [ ]  Unit testing
- [ ]  Automate unit testing with Github actions
- [x]  Detect if family member is home
- [x]  Override home status for over night detection
- [x]  Don't analyse footage if family member is home and not in override time
- [ ]  Grafana setup with Bull to visualise history (bull_exporter)
- [x]  Fix Reolink clips filename for date/time

**File Watching**

- [x]  Reolink Client (windows + mac) save files
- [x]  Notify server of new file

**Notifications**

- [x]  Upload image with detection to Dropbox (link valid for 4 hours)
- [x]  Send notification using IFTTT
- [x]  Upload video clip to Slack
- [x]  IFTTT notification open Slack channel
- [ ]  Remove old images stored in Dropbox (daily)
- [x]  Delete output image with prediction

**Computer Vision API**

- [x]  Object detection API
- [ ]  Object detection API - GPU enabled
- [ ]  Custom model - car open/closed
- [x]  Save car images every 30 minutes (data to train custom model)
- [ ]  Calculate time to detect person
- [ ]  Calculate average api response time

## How to run locally

### Redis Server

**`redis-server`**

Start the Redis server to manage jobs

### Start application

**`npm run dev` or `npm run start`**

Start the application in development mode using the "dev" keyword. Running in production use the "start" keyword.

## Environment Variables

## Docker

### How to build

docker build -t IMAGE_NAME .

### How to push to Dockerhub

docker push IMAGE_NAME

### Dockerhub

Repository is set to auto build on my Dockerhub

Docker bind container path **`/home/node/app/data`** to local path for data.