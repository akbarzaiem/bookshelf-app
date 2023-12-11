document.addEventListener("DOMContentLoaded", function () {
  const inputBookForm = document.getElementById("inputBook");
  const incompleteBookshelfList = document.getElementById(
    "incompleteBookshelfList"
  );
  const completeBookshelfList = document.getElementById(
    "completeBookshelfList"
  );
  const RENDER_EVENT = "render-bookshelf";
  const SAVED_EVENT = "saved-bookshelf";
  const STORAGE_KEY = "BOOKSHELF_APPS";
  inputBookForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const timestamp = new Date().getTime();
    const id = timestamp;
    const title = getInputValue("inputBookTitle");
    const author = getInputValue("inputBookAuthor");
    const year = parseInt(getInputValue("inputBookYear"));
    const isComplete = document.getElementById("inputBookIsComplete").checked;

    if (title && author && !isNaN(year)) {
      if (year < 0) {
        alert("Tahun tidak boleh negatif");
        return;
      }
      const newBook = createBook(id, title, author, year, isComplete);
      if (isComplete) {
        completeBookshelfList.appendChild(newBook.element);
        saveData(newBook.data);
        document.dispatchEvent(new Event(RENDER_EVENT));
      } else {
        incompleteBookshelfList.appendChild(newBook.element);
        saveData(newBook.data);
        document.dispatchEvent(new Event(RENDER_EVENT));
      }
      inputBookForm.reset();
    }
  });

  function getInputValue(elementId) {
    const inputElement = document.getElementById(elementId);
    if (inputElement instanceof HTMLInputElement) {
      return inputElement.value.trim();
    }
    return "";
  }

  function saveData(bookData) {
    let storedBooks = getStoredBooks();
    if (!storedBooks) {
      storedBooks = [];
    }
    storedBooks.push(bookData);
    if (isStorageExist()) {
      const parsed = JSON.stringify(storedBooks);
      localStorage.setItem(STORAGE_KEY, parsed);
      document.dispatchEvent(new Event(SAVED_EVENT));
    }
  }

  function getStoredBooks() {
    const storedData = localStorage.getItem(STORAGE_KEY);
    return storedData ? JSON.parse(storedData) : null;
  }

  function isStorageExist() {
    if (typeof Storage === undefined) {
      alert("Browser kamu tidak mendukung local storage");
      return false;
    }
    return true;
  }

  function createBook(id, title, author, year, isComplete) {
    const bookItem = document.createElement("article");
    bookItem.classList.add("book_item");

    const titleHeading = document.createElement("h2");
    titleHeading.textContent = title;

    const authorParagraph = document.createElement("p");
    authorParagraph.textContent = `Penulis: ${author}`;

    const yearParagraph = document.createElement("p");
    yearParagraph.textContent = `Tahun: ${year}`;

    const actionDiv = document.createElement("div");
    actionDiv.classList.add("action");

    const statusButton = document.createElement("button");
    statusButton.textContent = isComplete
      ? "Belum selesai di Baca"
      : "Selesai dibaca";
    statusButton.classList.add(isComplete ? "green" : "red");
    statusButton.addEventListener("click", function () {
      toggleStatus(id, this.closest(".book_item"));
    });

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Hapus buku";
    deleteButton.classList.add("red");
    deleteButton.addEventListener("click", function () {
      deleteBook(id, this.closest(".book_item"));
    });

    actionDiv.appendChild(statusButton);
    actionDiv.appendChild(deleteButton);

    bookItem.appendChild(titleHeading);
    bookItem.appendChild(authorParagraph);
    bookItem.appendChild(yearParagraph);
    bookItem.appendChild(actionDiv);

    const bookData = {
      id,
      title,
      author,
      year,
      isComplete,
    };

    return {
      element: bookItem,
      data: bookData,
    };
  }

  function toggleStatus(id, bookItem) {
    const isComplete = bookItem.parentNode.id === "completeBookshelfList";
    let storedBooks = getStoredBooks();

    const bookIndex = storedBooks.findIndex((book) => book.id == id);

    if (bookIndex !== -1) {
      storedBooks[bookIndex].isComplete = !isComplete;
      updateLocalStorage(storedBooks);

      //UI
      if (isComplete) {
        incompleteBookshelfList.appendChild(bookItem);
      } else {
        completeBookshelfList.appendChild(bookItem);
      }

      const statusButton = bookItem.querySelector("button");
      statusButton.textContent = isComplete
        ? "Selesai dibaca"
        : "Belum selesai di Baca";
      statusButton.classList.toggle("green");
      statusButton.classList.toggle("red");
    }
  }

  function updateLocalStorage(data) {
    const parsed = JSON.stringify(data);
    localStorage.setItem(STORAGE_KEY, parsed);
  }

  function deleteBook(id, bookItem) {
    let storedBooks = getStoredBooks();

    if (storedBooks) {
      const bookIndex = storedBooks.findIndex((book) => book.id === id);

      if (bookIndex !== -1) {
        storedBooks.splice(bookIndex, 1);

        const parsed = JSON.stringify(storedBooks);
        localStorage.setItem(STORAGE_KEY, parsed);

        // Remove book card UI
        if (bookItem) {
          bookItem.remove();
        }

        document.dispatchEvent(new Event(RENDER_EVENT));
      }
    }
  }

  function searchBook() {
    const searchBookForm = document.getElementById("searchBook");
    searchBookForm.addEventListener("submit", function (event) {
      event.preventDefault();
      const searchBookTitleInput = document.getElementById("searchBookTitle");
      const searchBookTitleValue = searchBookTitleInput.value;

      handleSearch(searchBookTitleValue);
    });
  }

  function handleSearch(searchTerm) {
    const allBooks = document.querySelectorAll(".book_item");

    allBooks.forEach((book) => {
      const titleParagraph = book.querySelector("h2");
      const authorParagraph = book.querySelector("p");
      const title = titleParagraph.textContent.toLowerCase();
      const author = authorParagraph.textContent
        .split(":")[1]
        .trim()
        .toLowerCase();

      if (
        title.includes(searchTerm.toLowerCase()) ||
        author.includes(searchTerm.toLowerCase())
      ) {
        book.style.display = "block";
      } else {
        book.style.display = "none";
      }
    });
  }

  searchBook();

  function loadDataFromStorage() {
    const storedBooks = getStoredBooks();
    if (storedBooks !== null) {
      for (const book of storedBooks) {
        const bookElement = createBook(
          book.id,
          book.title,
          book.author,
          book.year,
          book.isComplete
        ).element;

        if (book.isComplete) {
          completeBookshelfList.appendChild(bookElement);
        } else {
          incompleteBookshelfList.appendChild(bookElement);
        }
      }
    }

    document.dispatchEvent(new Event(RENDER_EVENT));
  }

  if (isStorageExist()) {
    loadDataFromStorage();
  }
});
