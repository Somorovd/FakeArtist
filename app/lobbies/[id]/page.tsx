"use client";

import React, { useEffect, useState } from "react";
import UsersList from "@/components/lobby/users-list";
import { Check, Copy } from "lucide-react";
import { useLobby } from "@/hooks/use-lobby";
import { useRouter } from "next/navigation";
import LobbyCanvas from "@/components/lobby/lobby-canvas";
import { useUser } from "@clerk/nextjs";

import { LiveKitRoom, RoomAudioRenderer } from "@livekit/components-react";
import LobbyVideoConference from "@/components/lobby/lobby-video-conference";

const LobbyPage = ({ params }: { params: { id: string } }) => {
  const { lobby, fetchLobby, loading, resetLoading } = useLobby();
  const [icon, setIcon] = useState<"copy" | "check">("copy");
  const [token, setToken] = useState("");
  const router = useRouter();
  const { user: self } = useUser();

  useEffect(() => {
    resetLoading();
  }, [params.id]);

  useEffect(() => {
    if (loading === "idle") {
      fetchLobby(params.id);
    }
  }, [loading]);

  useEffect(() => {
    // livekit
    if (!lobby || !self) return;
    (async () => {
      try {
        const resp = await fetch(
          `/api/get-participant-token?room=${lobby._id}&username=${self.id}`
        );
        const data = await resp.json();
        setToken(data.token);
      } catch (e) {
        console.error(e);
      }
    })();
  }, [lobby, self]);

  const toggleCopy = () => {
    setIcon("check");
    setTimeout(() => setIcon("copy"), 1500);
  };

  if (loading === "complete" && !lobby) {
    return router.push("/");
  }

  return (
    <>
      <div className="flex gap-4 justify-center py-8 text-lg">
        {loading === "complete" ? (
          <>
            <p>
              Share your invite code:
              <span className="font-bold">
                {lobby?.inviteCode ||
                  "___________________________________________"}
              </span>
            </p>
            <span onClick={toggleCopy} className="hover:cursor-pointer">
              {icon === "copy" ? (
                <Copy
                  width={16}
                  onClick={() =>
                    navigator.clipboard.writeText(lobby?.inviteCode || "")
                  }
                />
              ) : (
                <Check width={16} />
              )}
            </span>
          </>
        ) : (
          <p>
            Finding Lobby: <span className="font-bold">{params.id}</span>
          </p>
        )}
      </div>
      {loading === "complete" ? (
        <div className="flex justify-center space-x-4">
          <LiveKitRoom
            video={true}
            audio={true}
            token={token}
            serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
            data-lk-theme=""
            style={{ height: "100dvh" }}
          >
            <LobbyVideoConference />
            <RoomAudioRenderer />
          </LiveKitRoom>
          <LobbyCanvas />
        </div>
      ) : null}
    </>
  );
};

export default LobbyPage;
