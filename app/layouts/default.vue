<template>
  <main class="display-flex flex-col justify-between max-h-screen max-w-screen mx-1">
    <Nav />
    <Transition name="page" mode="out-in">
      <slot />
    </Transition>
    <Footer />
  </main>
</template>

<style scoped>
</style>