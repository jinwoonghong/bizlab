"use client";

import { useState, FormEvent } from "react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

interface PasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerified: (password: string) => void;
}

export default function PasswordModal({
  isOpen,
  onClose,
  onVerified,
}: PasswordModalProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setError("Password is required");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (data.verified) {
        onVerified(password);
        setPassword("");
        setError("");
      } else {
        setError("Incorrect password");
      }
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setPassword("");
    setError("");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Admin Verification">
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-sm text-gray-600">
          Enter the admin password to continue.
        </p>
        <Input
          label="Password"
          name="password"
          type="password"
          value={password}
          onChange={(e) => setPassword((e.target as HTMLInputElement).value)}
          error={error}
          placeholder="Enter admin password"
          autoFocus
        />
        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading}>
            Verify
          </Button>
        </div>
      </form>
    </Modal>
  );
}
