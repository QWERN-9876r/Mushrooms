import adapter from '@sveltejs/adapter-static'

const [repositoryOwner, repositoryName] =
    process.env.GITHUB_REPOSITORY?.split('/') ?? []
const isUserOrOrganizationSite =
    repositoryName === `${repositoryOwner}.github.io`
const base =
    process.env.GITHUB_ACTIONS && repositoryName && !isUserOrOrganizationSite
        ? `/${repositoryName}`
        : ''

/** @type {import('@sveltejs/kit').Config} */
const config = {
    compilerOptions: {
        // Force runes mode for the project, except for libraries. Can be removed in svelte 6.
        runes: ({ filename }) =>
            filename.split(/[/\\]/).includes('node_modules') ? undefined : true,
    },
    kit: {
        // adapter-auto only supports some environments, see https://svelte.dev/docs/kit/adapter-auto for a list.
        // If your environment is not supported, or you settled on a specific environment, switch out the adapter.
        // See https://svelte.dev/docs/kit/adapters for more information about adapters.
        adapter: adapter(),
        paths: { base },
    },
}

export default config
