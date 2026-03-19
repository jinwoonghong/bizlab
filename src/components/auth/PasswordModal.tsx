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
      setError("비밀번호를 입력해주세요");
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
        setError("비밀번호가 올바르지 않습니다");
      }
    } catch {
      setError("오류가 발생했습니다. 다시 시도해주세요.");
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
    <Modal isOpen={isOpen} onClose={handleClose} title="관리자 인증">
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-sm text-gray-600">
          계속하려면 관리자 비밀번호를 입력하세요.
        </p>
        <Input
          label="비밀번호"
          name="password"
          type="password"
          value={password}
          onChange={(e) => setPassword((e.target as HTMLInputElement).value)}
          error={error}
          placeholder="관리자 비밀번호 입력"
          autoFocus
        />
        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={handleClose}>
            취소
          </Button>
          <Button type="submit" isLoading={isLoading}>
            확인
          </Button>
        </div>
      </form>
    </Modal>
  );
}
