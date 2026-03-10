document.addEventListener("DOMContentLoaded", () => {
    // UI Elements
    const modeSelect = document.getElementById("addressing-mode");
    const segmentRegSelect = document.getElementById("segment-reg");
    
    // Groups
    const segmentGroup = document.getElementById("segment-group");
    const genRegGroup = document.getElementById("gen-reg-group");
    const ptrRegGroup = document.getElementById("ptr-reg-group");
    const spGroup = document.getElementById("sp-group");
    const dataGroup = document.getElementById("data-group");
    const dispGroup = document.getElementById("disp-group");

    // Form panels
    const calcBtn = document.getElementById("calc-btn");
    const resetBtn = document.getElementById("reset-btn");
    const resultsPanel = document.getElementById("results-panel");
    const emptyState = document.getElementById("empty-state");

    let isFirstLoad = true;

    // Handle visible input fields based on addressing mode
    const updateVisibleFields = () => {
        const mode = modeSelect.value;
        
        // Hide all dynamically changing inputs
        segmentGroup.style.display = 'none';
        genRegGroup.style.display = 'none';
        ptrRegGroup.style.display = 'none';
        spGroup.style.display = 'none';
        dataGroup.style.display = 'none';
        dispGroup.style.display = 'none';

        // Select the main configuration card
        const formPanel = document.querySelector('.control-center');
        
        let cardAnim = 'cardExpand';
        switch (mode) {
            case "direct": cardAnim = 'cardExpand'; break;
            case "indirect": cardAnim = 'cardScaleIn'; break;
            case "register-direct": cardAnim = 'cardPulseBlue'; break;
            case "register-indirect": cardAnim = 'cardCrackRotate'; break;
            case "immediate": cardAnim = 'cardCrackRotate'; break;
            case "displacement": cardAnim = 'cardCrackRotate'; break;
            case "stack": cardAnim = 'cardExpand'; break;
        }

        // Select animation based on mode for internal items
        let animName = 'slideUp';
        switch (mode) {
            case "direct": animName = 'slideLeft'; break;
            case "indirect": animName = 'scaleIn'; break;
            case "register-direct": animName = 'slideDown'; break;
            case "register-indirect": animName = 'flipInX'; break;
            case "immediate": animName = 'bounceIn'; break;
            case "displacement": animName = 'swingIn'; break;
            case "stack": animName = 'slideUp'; break;
        }

        let delayCounter = 1;
        
        // Trigger card animation only on user change to preserve initial load fade
        if (!isFirstLoad) {
            formPanel.style.opacity = '1';
            formPanel.classList.remove('fade-in');
            formPanel.style.animation = 'none';
            void formPanel.offsetWidth;
            // The CrackRotate animation needs to run slightly longer (0.8s) for the visual effect
            const duration = cardAnim === 'cardCrackRotate' ? '0.8s' : '0.5s';
            formPanel.style.animation = `${cardAnim} ${duration} cubic-bezier(0.16, 1, 0.3, 1)`;
        }

        // Animate elements slightly on reveal
        const showWithAnim = (el) => {
            el.style.display = 'block';
            el.style.animation = 'none';
            // Trigger reflow
            void el.offsetWidth;
            el.style.animation = `${animName} 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards`;
            el.style.animationDelay = `${delayCounter * 0.1}s`;
            delayCounter++;
        };

        switch (mode) {
            case "direct":
                showWithAnim(segmentGroup);
                showWithAnim(dispGroup); // Acts as direct address
                break;
            case "indirect":
                showWithAnim(segmentGroup);
                showWithAnim(dispGroup); // Acts as a memory pointer
                break;
            case "register-direct":
                // No segment needed for register direct
                showWithAnim(genRegGroup);
                break;
            case "register-indirect":
                showWithAnim(segmentGroup);
                showWithAnim(ptrRegGroup);
                break;
            case "immediate":
                // No segment needed for immediate usually, just storing the value
                showWithAnim(dataGroup);
                break;
            case "displacement":
                showWithAnim(segmentGroup);
                showWithAnim(ptrRegGroup);
                showWithAnim(dispGroup);
                break;
            case "stack":
                showWithAnim(segmentGroup);
                showWithAnim(spGroup);
                break;
        }

        updateSegmentDefault();
    };

    const updateSegmentDefault = () => {
        const mode = modeSelect.value;
        let defaultSeg = "DS";

        if (mode === "stack") {
            defaultSeg = "SS";
        } else if (mode === "register-indirect" || mode === "displacement") {
            const ptrReg = document.getElementById("ptr-reg").value;
            if (ptrReg === "BP") defaultSeg = "SS";
        }

        segmentRegSelect.value = defaultSeg;
    };

    // Listeners and bindings
    modeSelect.addEventListener("change", updateVisibleFields);
    document.getElementById("ptr-reg").addEventListener("change", updateSegmentDefault);

    // Init display
    updateVisibleFields();
    
    // Complete first load
    isFirstLoad = false;

    // Hex helpers
    const hexToInt = (hex) => hex ? parseInt(hex, 16) : 0;
    const intToHex = (int, pad) => int.toString(16).toUpperCase().padStart(pad, '0');

    const getCleanHex = (id) => {
        const el = document.getElementById(id);
        if (!el || el.closest('.reg-box').style.display === 'none') {
            return { val: 0, str: "0000" };
        }
        const valStr = el.value.replace(/[^0-9a-fA-F]/g, "") || "0000";
        return { val: hexToInt(valStr), str: valStr.padStart(4, '0') };
    };

    // Processor Core
    calcBtn.addEventListener("click", () => {
        const mode = modeSelect.value;
        
        // Validate segment if it's visible
        if (document.getElementById("segment-group").style.display !== 'none') {
            const segValInput = document.getElementById("segment-val").value;
            if (!segValInput) {
                const parent = document.getElementById("segment-group");
                parent.animate([
                    { transform: 'translateX(0px)' },
                    { transform: 'translateX(-5px)' },
                    { transform: 'translateX(5px)' },
                    { transform: 'translateX(0px)' }
                ], { duration: 300, iterations: 2 });
                document.getElementById("segment-val").focus();
                return;
            }
        }

        const segRegName = segmentRegSelect.value;
        const segObj = getCleanHex("segment-val");
        
        let ea = 0;
        let eaMathHTML = '';
        let formulaStr = '';

        // 20-bit segmentation
        const shiftedSeg = (segObj.val << 4) & 0xFFFFF; 

        // Block generator util
        const node = (text, isAcc = false) => `<div class="node ${isAcc ? 'text-accent' : ''}">${text}</div>`;
        const wrapVal = (hex) => `<span class="hex-prefix">0x</span>${hex}`;
        const conn = (sym) => `<div class="connector">${sym}</div>`;
        
        let skipPA = false;

        if (mode === "direct") {
            const disp = getCleanHex("disp-val");
            ea = disp.val;
            formulaStr = `EA = Direct Address`;
            eaMathHTML = `${node('ADDR', true)} ${conn('=')} ${node(wrapVal(disp.str))}`;
        }
        else if (mode === "indirect") {
            const ptrAddr = getCleanHex("disp-val");
            ea = ptrAddr.val; // In a real system, EA comes from memory. We just use the ptr value directly. 
            formulaStr = `EA = [Memory Pointer]`;
            eaMathHTML = `${node('[ADDR]', true)} ${conn('=')} ${node(wrapVal(ptrAddr.str))}`;
        }
        else if (mode === "register-direct") {
            const regMode = document.getElementById("gen-reg").value;
            formulaStr = `Operand in Register`;
            eaMathHTML = `${node('Reg', true)} ${conn('=')} ${node(regMode, true)}`;
            ea = 0;
            skipPA = true; // No Physical address for registers
        }
        else if (mode === "register-indirect") {
            const ptr = getCleanHex("ptr-val");
            const ptrName = document.getElementById("ptr-reg").value;
            ea = ptr.val;
            formulaStr = `EA = [${ptrName}]`;
            eaMathHTML = `${node(ptrName, true)} ${conn('=')} ${node(wrapVal(ptr.str))}`;
        }
        else if (mode === "immediate") {
            const data = getCleanHex("data-val");
            formulaStr = `Operand is Immediate Data`;
            eaMathHTML = `${node('DATA', true)} ${conn('=')} ${node(wrapVal(data.str))}`;
            ea = 0;
            skipPA = true; // No PA
        }
        else if (mode === "displacement") {
            const ptr = getCleanHex("ptr-val");
            const disp = getCleanHex("disp-val");
            const ptrName = document.getElementById("ptr-reg").value;
            ea = (ptr.val + disp.val) & 0xFFFF;
            formulaStr = `EA = [${ptrName}] + Disp`;
            eaMathHTML = `${node(ptrName, true)} ${node(wrapVal(ptr.str))} ${conn('+')} ${node('DISP', true)} ${node(wrapVal(disp.str))}`;
        }
        else if (mode === "stack") {
            const sp = getCleanHex("sp-val");
            ea = sp.val;
            formulaStr = `Stack Pointer = SP`;
            eaMathHTML = `${node('SP', true)} ${conn('=')} ${node(wrapVal(sp.str))}`;
        }

        const pa = (shiftedSeg + ea) & 0xFFFFF;

        // Render mappings
        document.getElementById("formula-badge").textContent = formulaStr;
        
        if (!skipPA) {
            document.querySelectorAll('.stream-block')[0].style.display = 'block';
            document.querySelector('.core-result').style.display = 'block';
            document.querySelector('.block-title').textContent = "SEGMENT SHIFT (10H)";
            document.querySelectorAll('.stream-block')[1].querySelector('.block-title').textContent = "EFFECTIVE ADDRESS [16-bit]";
            
            document.getElementById("res-seg-name").textContent = segRegName;
            document.getElementById("res-seg-shift").textContent = intToHex(shiftedSeg, 5);
            document.getElementById("res-pa-seg").textContent = intToHex(shiftedSeg, 5) + "H";
            document.getElementById("res-pa-ea").textContent = intToHex(ea, 4) + "H";
            document.getElementById("res-pa-final").textContent = intToHex(pa, 5);
        } else {
            document.querySelectorAll('.stream-block')[0].style.display = 'none';
            document.querySelector('.core-result').style.display = 'none';
            document.querySelectorAll('.stream-block')[1].querySelector('.block-title').textContent = "OPERAND LOCATION";
        }

        document.getElementById("res-ea-math").innerHTML = eaMathHTML;
        document.getElementById("res-ea-val").textContent = skipPA ? "N/A" : intToHex(ea, 4);

        // UI State Swap
        emptyState.classList.add("hidden");
        resultsPanel.classList.remove("hidden");
        
        // Retrigger base animation
        resultsPanel.style.animation = 'none';
        void resultsPanel.offsetWidth;
        resultsPanel.style.animation = 'slideLeft 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards';

        // Staggered child animations
        const blocks = [
            document.querySelectorAll('.stream-block')[0],
            document.querySelectorAll('.stream-block')[1],
            document.querySelector('.core-result')
        ];

        let delayInc = 0.2;
        blocks.forEach((block) => {
            if (block.style.display !== 'none') {
                block.style.opacity = '0';
                block.style.animation = 'none';
                void block.offsetWidth;
                block.style.animation = `slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards`;
                block.style.animationDelay = `${delayInc}s`;
                delayInc += 0.15;
            }
        });
    });

    // Reset handler
    resetBtn.addEventListener("click", () => {
        setTimeout(() => {
            updateVisibleFields();
            resultsPanel.classList.add("hidden");
            emptyState.classList.remove("hidden");
        }, 10);
    });

    // Input masking for HEX
    document.querySelectorAll('input[type="text"]').forEach(input => {
        input.addEventListener('input', function() {
            this.value = this.value.replace(/[^0-9A-Fa-f]/g, '').toUpperCase();
        });
    });
});
