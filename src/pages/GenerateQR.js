import React, { useEffect, useState } from "react";
import QRCode from "react-qr-code";
import { auth } from "../firebase";

const GenerateQR = () => {
  const [qrValue, setQrValue] = useState("");

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      // Local testing URL
      const url = `${window.location.origin}/transaction-pdf?uid=${user.uid}`;

      setQrValue(url);
    }
  }, []);

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h2>Your Weekly QR Code</h2>
      <p>Scan with your mobile camera to view your financial summary.</p>

      {qrValue && (
        <>
          <div style={{ marginTop: "30px" }}>
            <QRCode value={qrValue} size={200} />
          </div>
          <p style={{ marginTop: "10px", fontSize: "12px" }}>{qrValue}</p>
        </>
      )}
    </div>
  );
};

export default GenerateQR;
