const modalTriggers = document.querySelectorAll("[data-modal-open]");
const modalCloseControls = document.querySelectorAll("[data-modal-close]");
const modals = document.querySelectorAll(".modal");

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) {
        return;
    }

    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
}

function closeModal(modal) {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");

    if (!document.querySelector(".modal.is-open")) {
        document.body.style.overflow = "";
    }
}

modalTriggers.forEach((trigger) => {
    trigger.addEventListener("click", () => {
        openModal(trigger.dataset.modalOpen);
    });
});

modalCloseControls.forEach((control) => {
    control.addEventListener("click", () => {
        const modal = control.closest(".modal");
        if (modal) {
            closeModal(modal);
        }
    });
});

modals.forEach((modal) => {
    modal.addEventListener("click", (event) => {
        if (event.target === modal) {
            closeModal(modal);
        }
    });
});

document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") {
        return;
    }

    const activeModal = document.querySelector(".modal.is-open");
    if (activeModal) {
        closeModal(activeModal);
    }
});
