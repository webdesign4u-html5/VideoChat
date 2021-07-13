
let Peer = require('simple-peer')
let socket = io()
const video = document.querySelector('video')
const filter = document.querySelector('#filter')
const checkboxMode = document.querySelector('#theme')
let client = {}
let currfilter

navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    .then(stream => {
        socket.emit('NewClient')
        video.srcObject= stream
        video.play()

         //used to add filters
        filter.addEventListener('change', (event) => {
            currfilter = event.target.value
            video.style.filter = currfilter
            SendFilter(currfilter)
            event.preventDefault
        })
    
        //used to mute/unmute video 
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
    
        //used to mute/unmute audio 
        let audiomute=document.querySelector('#mutemic')
        audiomute.addEventListener('click', () => {
            if(stream.getAudioTracks()[0].enabled){
            stream.getAudioTracks()[0].enabled= !(stream.getAudioTracks()[0].enabled);
            document.getElementById('mutemic').innerHTML = '<i class="fas fa-microphone-slash"></i>';
            }
            else{
            stream.getAudioTracks()[0].enabled= !(stream.getAudioTracks()[0].enabled);
            document.getElementById('mutemic').innerHTML = '<i class="fas fa-microphone"></i>';
            }
        }
        )
       

        //used to initialize a peer
        function InitPeer(type) {
            let peer = new Peer({ initiator: (type == 'init') ? true : false, stream: stream, trickle: false })
            peer.on('stream', function (stream) {
                CreateVideo(stream)
            })
            peer.on('data', function (data) {
                let decodedData = new TextDecoder('utf-8').decode(data)
                let peervideo = document.querySelector('#peerVideo')
                peervideo.style.filter = decodedData
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
            //used for mute/unmute the peer
            
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

        //used for when third person try to join and two people are already in the meeting. 
        function SessionActive() {
            document.write('Session Active. Please come back later')
        }

      
        function RemovePeer() {
            document.getElementById("peerVideo").remove();
            if (client.peer) {
                client.peer.destroy()
            }

        }
         
        function SendFilter(filter) {
            if (client.peer) {
                client.peer.send(filter)
            }
        }

        socket.on('BackOffer', FrontAnswer)
        socket.on('BackAnswer', SignalAnswer)
        socket.on('SessionActive', SessionActive)
        socket.on('CreatePeer', MakePeer)
        socket.on('Disconnect', RemovePeer)

    })
    .catch(err => document.write(err))
   
    
//used to change theme

checkboxMode.addEventListener('click', () => {
    if (checkboxTheme.checked == true) {
        document.body.style.backgroundColor = '#212529'
    }
    else {
        document.body.style.backgroundColor = '#fff'
    }
}
)

