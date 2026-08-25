import React from 'react'
import { Vanta } from 'vanta-react'

function VantaBackground() {
    return (
        <Vanta
            effect="net"                   
            style={{
                position: "fixed",
                width: "100%",
                height: "100%",
                top: 0,
                left: 0,
                zIndex: -1,          
            }}
            options={{
                mouseControls: false,
                touchControls: true,
                gyroControls: false,
                minHeight: 200.00,
                minWidth: 200.00,
                scale: 1.00,
                scaleMobile: 1.00,

                color: 0x2323aa,
                backgroundColor: 0x23153c,
                points: 8,
                maxDistance: 18,
                spacing: 18,
                showDots: true,

            }}
        />
    )
}

export default VantaBackground
