
let Peer = require('simple-peer')
let socket = io()
const video = document.querySelector('video')
const checkboxTheme = document.querySelector('#theme')
let client = {}

navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    .then(stream => {
        socket.emit('NewClient')
        video.srcObject= stream
        video.play()

        //used to initialize a peer

        let videomute=document.querySelector('#vidbutton')
        videomute.addEventListener('click', () => {
            if(stream.getVideoTracks()[0].enabled){
            stream.getVideoTracks()[0].enabled= !(stream.getVideoTracks()[0].enabled);
            document.getElementById('vidbutton').innerHTML = '<i class="fas fa-video-slash"></i>';
            }
            else{
            stream.getVideoTracks()[0].enabled= !(stream.getVideoTracks()[0].enabled);
            document.getElementById('vidbutton').innerHTML = '<i class="fas fa-video"></i>';
            }
        }
        )
        function InitPeer(type) {
            let peer = new Peer({ initiator: (type == 'init') ? true : false, stream: stream, trickle: false })
            peer.on('stream', function (stream) {
                CreateVideo(stream)
            })
            return peer
        }

        //for peer of type init
        function MakePeer() {
            client.gotAnswer = false
            let peer = InitPeer('init')
            peer.on('signal', function (data) {
                if (!client.gotAnswer) {
                    socket.emit('Offer', data)
                }
            })
            client.peer = peer
        }

        //for peer of type not init
        function FrontAnswer(offer) {
            let peer = InitPeer('notInit')
            peer.on('signal', (data) => {
                socket.emit('Answer', data)
            })
            peer.signal(offer)
            client.peer = peer
        }

        function SignalAnswer(answer) {
            client.gotAnswer = true
            let peer = client.peer
            peer.signal(answer)
        }

        function CreateVideo(stream) {
            let muteaudio= document.querySelector('#muteaudio')
            let video = document.createElement('video')
            video.id = 'peerVideo'
            video.srcObject = stream
            video.setAttribute('class', 'embed-responsive-item')
            document.querySelector('#peerDiv').appendChild(video)
            video.play()
            //wait for 1 sec
            muteaudio.addEventListener('click', () => {
                if (video.volume != 0){
                  video.volume = 0
                  document.getElementById('muteaudio').innerHTML = '<i class="fas fa-volume-mute"></i>';
              }
              else{
                  video.volume = 1
                  document.getElementById('muteaudio').innerHTML = '<i class="fas fa-volume-up"></i>';
              }
              })
           

        }

        function SessionActive() {
            document.write('Session Active. Please come back later')
        }


        function RemovePeer() {
            document.getElementById("peerVideo").remove();
            document.getElementById("muteText").remove();
            if (client.peer) {
                client.peer.destroy()
            }

        }

        socket.on('BackOffer', FrontAnswer)
        socket.on('BackAnswer', SignalAnswer)
        socket.on('SessionActive', SessionActive)
        socket.on('CreatePeer', MakePeer)
        socket.on('Disconnect', RemovePeer)

    })
    .catch(err => document.write(err))
   
    

checkboxTheme.addEventListener('click', () => {
    if (checkboxTheme.checked == true) {
        document.body.style.backgroundColor = '#212529'
        if (document.querySelector('#muteText')) {
            document.querySelector('#muteText').style.color = "#fff"
        }

    }
    else {
        document.body.style.backgroundColor = '#fff'
        if (document.querySelector('#muteText')) {
            document.querySelector('#muteText').style.color = "#212529"
        }
    }
}
)

