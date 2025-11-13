"use client";
import { useRouter } from "next/navigation";
import { ReactNode, useState } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { UserAvatar } from "./user-avatar";

export const JoinRequest = ({
  id,
  message,
  user,
  createdAt,
  handleApproveJoinRequest,
}: {
  id: string;
  message?: string;
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
  createdAt: Date;
  handleApproveJoinRequest: (requestId: string) => Promise<void>;
}): ReactNode => {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <Card className="p-4 flex flex-col gap-0">
      <div className="flex items-center gap-3 mb-2">
        <UserAvatar
          avatarUrl={user.image || undefined}
          name={user.name || ""}
        />
        <div>
          <p className="font-semibold text-gray-900">{user.name}</p>
        </div>
      </div>

      {message && (
        <p className="text-sm text-gray-600 mb-2 italic line-clamp-3">
          “{message}”
        </p>
      )}

      <p className="text-xs text-gray-500 mb-4">
        Requested {formatDate(createdAt)}
      </p>

      <div className="flex gap-2">
        {/* View Details Button */}
        {message && (
          <Button
            size="sm"
            variant="outline"
            className="flex-1"
            onClick={() => setShowModal(true)}
          >
            View Details
          </Button>
        )}

        {/* Approve Button */}
        <Button
          size="sm"
          className="flex-1 bg-green-600 hover:bg-green-700 text-white"
          onClick={() => handleApproveJoinRequest(id)}
        >
          Approve
        </Button>
      </div>

      {/* Modal for full message */}
      {showModal && (
        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                Join Request from {user.name}
              </DialogTitle>
            </DialogHeader>

            {/* Move content outside of DialogDescription */}
            <div className="space-y-2 mt-2">
              {message && (
                <p className="text-sm text-gray-600 italic">“{message}”</p>
              )}
              <p className="text-xs text-gray-500">
                Requested {formatDate(createdAt)}
              </p>
              <Button
                variant="link"
                onClick={() => router.push(`/dashboard/users/${user.id}`)}
                className="text-celestial-blue text-sm p-0"
              >
                View Profile
              </Button>
            </div>

            <DialogFooter className="flex justify-between mt-4">
              <Button variant="outline" onClick={() => setShowModal(false)}>
                Close
              </Button>
              <Button
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={() => {
                  handleApproveJoinRequest(id);
                  setShowModal(false);
                }}
              >
                Approve
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </Card>
  );
};
