<template>
  <main class="flex flex-col justify-between min-h-screen min-w-screen">
    <!-- <Nav /> -->
    <Transition name="page" mode="out-in">
      <slot />
    </Transition>
    <Footer />
  </main>
</template>

<style scoped></style>