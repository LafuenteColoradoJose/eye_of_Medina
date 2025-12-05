<template>
  <main class="flex flex-col h-4/6">
    <aside class="flex flex-row justify-start">
      <Nav />
      <Transition name="page" mode="out-in">
        <slot />
      </Transition>
    </aside>
    <Footer />
  </main>
</template>

<style scoped></style>