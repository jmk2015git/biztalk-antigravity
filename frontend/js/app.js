// app.js

document.addEventListener("DOMContentLoaded", () => {
    // 1. DOM Elements
    const inputText = document.getElementById("inputText");
    const charCount = document.getElementById("charCount");
    const targetBtns = document.querySelectorAll(".target-btn");
    const convertBtn = document.getElementById("convertBtn");
    const outputText = document.getElementById("outputText");
    const copyBtn = document.getElementById("copyBtn");
    
    const toast = document.getElementById("toast");
    const toastMessage = document.getElementById("toastMessage");
    
    // API 베이스 URL 설정 (동일 Origin 통신 지원으로 로컬 및 배포 환경 자동 대응)
    const API_BASE = window.location.origin;

    // 2. Character Counter
    inputText.addEventListener("input", () => {
        const length = inputText.value.length;
        charCount.textContent = length;
    });

    // 3. Target Audience Selection
    targetBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            // 기존 active 제거
            document.querySelector(".target-btn.active")?.classList.remove("active");
            // 현재 버튼 active 추가
            btn.classList.add("active");
        });
    });

    // 4. Toast Notification helper
    let toastTimeout;
    function showToast(message, isSuccess = true) {
        clearTimeout(toastTimeout);
        toastMessage.textContent = message;
        
        const icon = toast.querySelector(".toast-icon");
        if (isSuccess) {
            icon.textContent = "✓";
            icon.style.backgroundColor = "var(--success)";
        } else {
            icon.textContent = "✕";
            icon.style.backgroundColor = "hsl(0, 70%, 50%)";
        }

        toast.classList.add("show");
        
        // 3초 후 토스트 닫기
        toastTimeout = setTimeout(() => {
            toast.classList.remove("show");
        }, 3000);
    }

    // 5. Loading State Helper
    function setLoading(isLoading) {
        const btnText = convertBtn.querySelector(".btn-text");
        const loader = convertBtn.querySelector(".spinner-loader");

        if (isLoading) {
            convertBtn.disabled = true;
            inputText.disabled = true;
            btnText.style.opacity = "0";
            loader.classList.remove("hidden");
        } else {
            convertBtn.disabled = false;
            inputText.disabled = false;
            btnText.style.opacity = "1";
            loader.classList.add("hidden");
        }
    }

    // 6. Convert Tone Function
    async function convertTone() {
        const text = inputText.value.trim();
        const activeBtn = document.querySelector(".target-btn.active");
        const targetAudience = activeBtn ? activeBtn.dataset.target : null;

        if (!text) {
            showToast("변환할 본문을 입력해 주세요.", false);
            return;
        }

        if (!targetAudience) {
            showToast("수신 대상을 선택해 주세요.", false);
            return;
        }

        setLoading(true);
        outputText.value = ""; // 기존 결과 초기화
        copyBtn.disabled = true;

        try {
            const response = await fetch(`${API_BASE}/api/convert`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json; charset=utf-8"
                },
                body: JSON.stringify({
                    text: text,
                    target_audience: targetAudience
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.detail || "변환 요청에 실패했습니다.");
            }

            const data = await response.json();
            outputText.value = data.converted_text;
            copyBtn.disabled = false; // 복사 버튼 활성화
            showToast("말투 변환이 성공적으로 완료되었습니다!");

        } catch (error) {
            console.error("Conversion Error:", error);
            showToast(error.message || "오류가 발생했습니다. 다시 시도해 주세요.", false);
        } finally {
            setLoading(false);
        }
    }

    // 7. Copy to Clipboard Function
    async function copyToClipboard() {
        const textToCopy = outputText.value;
        if (!textToCopy) return;

        try {
            await navigator.clipboard.writeText(textToCopy);
            showToast("클립보드에 복사되었습니다.");
        } catch (err) {
            console.error("Copy failed:", err);
            showToast("복사에 실패했습니다. 직접 복사해 주세요.", false);
        }
    }

    // 8. Event Listeners
    convertBtn.addEventListener("click", convertTone);
    copyBtn.addEventListener("click", copyToClipboard);
});
