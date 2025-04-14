import React, { useState } from 'react';

interface VerificationCodePopupProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
  onVerifySuccess: () => void;
}

const VerificationCodePopup: React.FC<VerificationCodePopupProps> = ({ 
  isOpen, 
  onClose, 
  email,
  onVerifySuccess
}) => {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleCodeChange = (index: number, value: string) => {
    // Only allow numbers
    if (value && !/^\d+$/.test(value)) {
      return;
    }

    const newCode = [...code];
    
    // Handle pasting of full code
    if (value.length > 1 && index === 0) {
      // If pasting a 6-digit code
      if (value.length === 6 && /^\d+$/.test(value)) {
        const digits = value.split("");
        setCode(digits);
        // Focus the last input
        const lastInput = document.getElementById(`code-input-5`);
        if (lastInput) {
          (lastInput as HTMLInputElement).focus();
        }
        return;
      }
    }

    // Handle single digit
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`code-input-${index + 1}`);
      if (nextInput) {
        (nextInput as HTMLInputElement).focus();
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle backspace
    if (e.key === "Backspace" && !code[index] && index > 0) {
      const prevInput = document.getElementById(`code-input-${index - 1}`);
      if (prevInput) {
        (prevInput as HTMLInputElement).focus();
      }
    }
  };

  const handleVerifyCode = async () => {
    const verificationCode = code.join("");
    
    // Validate code length
    if (verificationCode.length !== 6) {
      setError("Please enter a 6-digit verification code");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Verify the code
      const response = await fetch("https://n8n-blue.up.railway.app/webhook/ada/api/verify-reset-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          email, 
          code: verificationCode
        }),
      });

      const data = await response.json() as { status: boolean; msg: string };
      
      // If code verification fails, show error
      if (!response.ok || !data.status) {
        setError(data.msg || "Invalid verification code. Please try again.");
        setIsLoading(false);
        return;
      }
      
      // If verification is successful, call the success callback
      onVerifySuccess();
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-[#0d1117] rounded-lg p-8 w-full max-w-md relative border border-gray-800">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-gray-400 hover:text-white bg-transparent border-0 outline-none p-0"
        >
          <div className="i-ph:x text-xl"></div>
        </button>
        
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">Verify Code</h2>
          <p className="text-gray-300">
            Enter the 6-digit code sent to {email}
          </p>
        </div>
        
        {error && (
          <div className="bg-red-500 text-white p-3 rounded-md mb-4">{error}</div>
        )}
        
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-gray-200 block">
              Verification Code
            </label>
            <div className="flex justify-between gap-2">
              {code.map((digit, index) => (
                <input
                  key={index}
                  id={`code-input-${index}`}
                  type="text"
                  maxLength={1}
                  className="w-full aspect-square text-center px-0 py-2 bg-[#0a0a0c] border border-gray-800 text-white text-xl font-bold focus:border-blue-500 focus:ring-blue-500 rounded-md"
                  value={digit}
                  onChange={(e) => handleCodeChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  autoFocus={index === 0}
                />
              ))}
            </div>
          </div>

          <button
            onClick={handleVerifyCode}
            className="w-full bg-[#1a2b4c] hover:bg-[#1f3461] text-white py-2 rounded-md"
            disabled={isLoading}
          >
            {isLoading ? "Verifying..." : "Verify Code"}
          </button>
          
          <div className="text-center mt-4">
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-white bg-transparent border-0 outline-none p-0"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerificationCodePopup;
