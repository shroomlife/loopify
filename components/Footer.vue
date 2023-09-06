<template>
  <footer>
    <div class="d-flex flex-column justify-content-between">
      <span>
        <Logo />
      </span>
      <small>&copy; 2023</small>
    </div>
    <div class="d-flex flex-column justify-content-end footer-links">
      <NuxtLink to="datenschutz">Datenschutz</NuxtLink>
      <NuxtLink to="impressum">Impressum</NuxtLink>
    </div>
  </footer>
</template>

<style lang="scss" scoped>
footer {
  position: fixed;
  background-color: $black;
  width: 100vw;
  height: $footer-height;
  padding: 14px;
  bottom: 0;

  color: white;

  display: flex;
  justify-content: space-between;

  .logo {
    height: 22px;
  }

  small {
    font-size: 9px;
  }

  .footer-links a {
    color: #FFF;
    text-align: right;
    font-size: 12px;
    font-style: normal;
    font-weight: 400;
    text-decoration: none;
  }

}
</style>
