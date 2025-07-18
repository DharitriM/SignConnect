"use client";

import type React from "react";
import { useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { v4 as uuidv4 } from "uuid";
import { Message, Participant } from "@/types/webrtc";

interface UserInfo {
  id?: string;
  name: string;
  email: string;
  avatar?: string;
  isHost?: boolean;
}

interface MediaState {
  audio: boolean;
  video: boolean;
  screenShare: boolean;
}

export interface WebRTCManagerProps {
  roomId: string;
  userInfo: UserInfo;
  isCreatingRoom: boolean;

  /* refs passed from the page ------------------------------------------- */
  localVideoRef: React.RefObject<HTMLVideoElement>;
  remoteVideosRef: React.RefObject<HTMLDivElement>;
  screenShareRef: React.RefObject<HTMLVideoElement>;

  /* callbacks ------------------------------------------------------------ */
  onConnectionChange: (connected: boolean) => void;
  onRoomCreated: (data: { roomId: string; host: UserInfo, participants: Participant[] }) => void;
  onRoomJoined: (data: {
    isHost: boolean;
    roomId: string;
    participants: Participant[];
    messages: Message[];
  }) => void;
  onRoomError: (err: string) => void;
  onWaitingForApproval: () => void;
  onJoinApproved: (d: {
    roomId: string;
    host: UserInfo;
    participants: Participant[];
  }) => void;
  onJoinRejected: (msg: string) => void;
  onJoinRequest: (d: { user: UserInfo; requestId: string }) => void;
  onParticipantUpdate: (p: Participant[]) => void;
  onMessageReceived: (m: {
    sender: UserInfo;
    text: string;
    timestamp: Date;
  }) => void;
  onUserMediaChanged: (id: string, s: MediaState) => void;
  onScreenShareStarted: (id: string, s: MediaStream) => void;
  onScreenShareStopped: (id: string) => void;
  onNewHostAssigned: (u: UserInfo) => void;
  onSignLanguageInterpretation: (b: boolean) => void;
  onVoiceToText: (t: string, s: UserInfo) => void;
  onMediaStateChange: (s: MediaState) => void;

  /* local‐side switches -------------------------------------------------- */
  isMuted: boolean;
  isVideoOn: boolean;
  isScreenSharing: boolean;
}

/** Object returned to the caller so they can drive features */
export interface WebRTCManagerHandle {
  toggleScreenShare: ()=>void;
  toggleVoiceToText(): void;
  approveJoinRequest(id: string): void;
  rejectJoinRequest(id: string, reason?: string): void;
  startSignLanguageInterpretation(): void;
  stopSignLanguageInterpretation(): void;
  sendMessage?: (txt: string) => void;
  cleanup?: () => void;
  /** Current state */
  isHost: boolean;
  participants: Participant[];
  isListening: boolean;
}

export function useWebRTCManager(props: WebRTCManagerProps): WebRTCManagerHandle {
  const {
    roomId,
    userInfo: rawUserInfo,
    isCreatingRoom,
    localVideoRef,
    remoteVideosRef,
    screenShareRef,
    /* callbacks */
    onConnectionChange,
    onRoomCreated,
    onRoomJoined,
    onRoomError,
    onWaitingForApproval,
    onJoinApproved,
    onJoinRejected,
    onJoinRequest,
    onParticipantUpdate,
    onMessageReceived,
    onUserMediaChanged,
    onScreenShareStarted,
    onScreenShareStopped,
    onNewHostAssigned,
    onSignLanguageInterpretation,
    onVoiceToText,
    onMediaStateChange,
    /* local switches */
    isMuted,
    isVideoOn,
    isScreenSharing,
  } = props;
  /* --------------------- state & refs ----------------------------------- */
  const userInfo = {
    ...rawUserInfo,
    id: rawUserInfo?.id ?? uuidv4(),
  };

type SpeechRecognition =
  typeof window.webkitSpeechRecognition;

  const [socket, setSocket] = useState<Socket | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isHost, setIsHost] = useState(false);

  const peerCons = useRef(new Map<string, RTCPeerConnection>());
  const remoteStreams = useRef(new Map<string, MediaStream>());

  /* ------ media‑state ref so we can compare inside callbacks ------------ */
  const mediaStateRef = useRef<MediaState>({
    audio: !isMuted,
    video: isVideoOn,
    screenShare: isScreenSharing,
  });

  /* ----------------------------- lifecycle ------------------------------ */
  useEffect(() => {
    init(); // eslint-disable-line @typescript-eslint/no-floating-promises
    return () => cleanup();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    mediaStateRef.current = {
      audio: !isMuted,
      video: isVideoOn,
      screenShare: isScreenSharing,
    };
    updateMediaState();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMuted, isVideoOn, isScreenSharing]);

  /* ------------------------------- init --------------------------------- */
  const init = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: isVideoOn,
        audio: !isMuted,
      });
      setLocalStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        localVideoRef.current.muted = true;
      }

      const s = await connectSocket();
      if (!s) throw new Error("socket‑io connection failed");
      setSocket(s);

      if (isCreatingRoom) {
        setIsHost(true);
        s.emit("create-room", { roomId, userInfo: { ...userInfo, isHost: true } });
      } else {
        s.emit("join-room", { roomId, userInfo });
      }

      setupSocketHandlers(s);
    } catch (err) {
      handleError(err);
    }
  };

  /* ----------------------------- socket --------------------------------- */
  const connectSocket = (): Promise<Socket> =>
    new Promise((res, rej) => {
      // const s = io(process.env.NEXT_PUBLIC_SOCKET_URL ?? "http://localhost:3000", {
      //   path: process.env.NEXT_PUBLIC_SOCKET_PATH ?? "/socket.io",
      //   auth: { token: userInfo.id },
      //   query: { roomId },
      //   transports: ["websocket"],
      // });
      const s = io(process.env.NEXT_PUBLIC_SOCKET_URL!, {
        path: process.env.NEXT_PUBLIC_SOCKET_PATH,
        transports: ["websocket"],
      });
      // s.once("connect", () => res(s));
      // s.once("connect_error", (e) => rej(e));
      s.on("connect", () => {
        console.log("✅ Connected:", s.id);
      });

      s.on("connect_error", (err) => {
        console.error("❌ Connection failed:", err.message);
      });
    });

  const setupSocketHandlers = (s: Socket) => {
    /* room lifecycle */
    s.on("room-created", (d) => {
      setIsHost(true);
      onRoomCreated(d);
    });

    s.on("room-joined", (d) => {
      setParticipants(d.participants);
      onRoomJoined({ ...d, isHost: d.participants.some((p: any) => p.id === userInfo.id && p.isHost) });
      d.participants
        .filter((p :any) => p.id !== userInfo.id)
        .forEach((p :any) => createOffer(p.id!)); // eslint-disable-line @typescript-eslint/no-non-null-assertion
    });

    /* ... (all your other handlers can remain the same) ... */
  };

  /* ------------------------------ rtc ----------------------------------- */
  const pcConfig: RTCConfiguration = {
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
  };

  const getPeer = (id: string) => {
    let pc = peerCons.current.get(id);
    if (!pc) {
      pc = new RTCPeerConnection(pcConfig);
      peerCons.current.set(id, pc);

      /* tracks */
      pc.ontrack = (ev) => {
        const [stream] = ev.streams;
        remoteStreams.current.set(id, stream);
        attachRemoteStream(id, stream);
        onConnectionChange(true);
      };

      /* ice */
      pc.onicecandidate = (ev) => {
        if (ev.candidate) socket?.emit("ice-candidate", { roomId, targetId: id, candidate: ev.candidate });
      };

      pc.onconnectionstatechange = () => {
        if (["failed", "disconnected"].includes(pc!.connectionState)) removePeer(id);
      };

      /* add local tracks */
      localStream?.getTracks().forEach((t) => pc!.addTrack(t, localStream!));
    }
    return pc;
  };

  const createOffer = async (targetId: string) => {
    const pc = getPeer(targetId);
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    socket?.emit("offer", { roomId, targetId, offer });
  };

  /* ---------------------------- helpers --------------------------------- */
  const attachRemoteStream = (uid: string, stream: MediaStream) => {
    const wrap = remoteVideosRef.current;
    if (!wrap) return;

    /* remove old */
    wrap.querySelector(`[data-uid="${uid}"]`)?.remove();

    const vid = document.createElement("video");
    vid.dataset.uid = uid;
    vid.srcObject = stream;
    vid.autoplay = true;
    vid.playsInline = true;
    vid.className = "w-full h-full object-cover rounded";

    wrap.appendChild(vid);
  };

  const updateMediaState = () => {
    if (!localStream) return;
    localStream.getAudioTracks().forEach((t) => (t.enabled = mediaStateRef.current.audio));
    localStream.getVideoTracks().forEach((t) => (t.enabled = mediaStateRef.current.video));
    socket?.emit("user-media-changed", { roomId, mediaState: mediaStateRef.current });
    onMediaStateChange(mediaStateRef.current);
  };

  const removePeer = (uid: string) => {
    peerCons.current.get(uid)?.close();
    peerCons.current.delete(uid);
    remoteStreams.current.delete(uid);
    remoteVideosRef.current?.querySelector(`[data-uid="${uid}"]`)?.remove();
  };

  /* --------------------------- cleanup ---------------------------------- */
  const cleanup = () => {
    peerCons.current.forEach((pc) => pc.close());
    localStream?.getTracks().forEach((t) => t.stop());
    screenStream?.getTracks().forEach((t) => t.stop());
    recognition?.stop();
    socket?.disconnect();
  };

  const handleError = (e: unknown) => {
    console.error(e);
    onRoomError(e instanceof Error ? e.message : String(e));
  };

  /* ------------- features exposed to the parent component --------------- */
  const toggleScreenShare = async () => {
    try {
      if (screenStream) {
        screenStream.getTracks().forEach((t) => t.stop());
        setScreenStream(null);
        socket?.emit("screen-share-stopped", { roomId });
      } else {
        const s = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
        setScreenStream(s);
        peerCons.current.forEach((pc) => s.getTracks().forEach((t) => pc.addTrack(t, s)));
        socket?.emit("screen-share-started", { roomId });
        s.getTracks()[0].onended = toggleScreenShare;
      }
    } catch (err) {
      handleError(err);
    }
  };

  const toggleVoiceToText = () => {
    if (!recognition) return;
    if (isListening) recognition.stop();
    else recognition.start();
    setIsListening(!isListening);
  };

  const approveJoinRequest = (id: string) => isHost && socket?.emit("approve-join-request", { roomId, requestId: id });
  const rejectJoinRequest = (id: string, r = "Host rejected") =>
    isHost && socket?.emit("reject-join-request", { roomId, requestId: id, reason: r });

  /* --------------------------------------------------------------------- */
  return {
    toggleScreenShare,
    toggleVoiceToText,
    approveJoinRequest,
    rejectJoinRequest,
    startSignLanguageInterpretation: () => socket?.emit("sign-language-interpretation", { roomId, enabled: true }),
    stopSignLanguageInterpretation: () => socket?.emit("sign-language-interpretation", { roomId, enabled: false }),
    sendMessage: (text) =>
      socket?.emit("new-message", { roomId, text, sender: userInfo, timestamp: new Date() }),
    isHost,
    participants,
    isListening,
    cleanup
  };
}
