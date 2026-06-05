(function initMyFitClubDataLayer() {
  function usingCloud() {
    return (
      window.MyFitClubFirebase?.isEnabled?.() && window.MyFitClubFirestore?.isReady?.()
    );
  }

  async function init(onRefresh) {
    if (!window.MyFitClubFirebase?.isEnabled?.()) {
      return false;
    }

    window.MyFitClubFirestore.setOnRefresh(onRefresh);
    return window.MyFitClubFirestore.init();
  }

  function destroy() {
    if (window.MyFitClubFirestore) {
      window.MyFitClubFirestore.destroy();
    }
  }

  function list(collectionName) {
    if (usingCloud()) {
      return window.MyFitClubFirestore.list(collectionName);
    }

    return MyFitClubStore.list(collectionName);
  }

  function count(collectionName) {
    if (usingCloud()) {
      return window.MyFitClubFirestore.count(collectionName);
    }

    return MyFitClubStore.count(collectionName);
  }

  function add(collectionName, item) {
    if (usingCloud()) {
      return window.MyFitClubFirestore.add(collectionName, item);
    }

    return MyFitClubStore.add(collectionName, item);
  }

  function replace(collectionName, items) {
    if (usingCloud()) {
      return window.MyFitClubFirestore.replace(collectionName, items);
    }

    return MyFitClubStore.replace(collectionName, items);
  }

  function update(mutator) {
    if (usingCloud()) {
      window.MyFitClubFirestore.update(mutator);
      return;
    }

    MyFitClubStore.update(mutator);
  }

  async function consumeInviteCode(code) {
    if (usingCloud()) {
      await window.MyFitClubFirestore.incrementInviteCode(code);
      return;
    }

    MyFitClubStore.update((db) => {
      db.invitationCodes = db.invitationCodes.map((inviteCode) =>
        inviteCode.code === code
          ? { ...inviteCode, usedCount: inviteCode.usedCount + 1 }
          : inviteCode,
      );
    });
  }

  function isCloudData() {
    return usingCloud();
  }

  window.MyFitClubData = {
    add,
    consumeInviteCode,
    count,
    destroy,
    init,
    isCloudData,
    list,
    replace,
    update,
  };
})();
