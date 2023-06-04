import { GlobalState } from '../engine/GlobalState'
import { exportToWeb2 } from '../engine/Web2Export'
import { createFooter } from '../html/Footer'
import { createHeader } from '../html/Header'
import { createHtml5 } from '../html/Html5'
import { createStyleSheet } from '../html/StyleSheet'

export async function createNewsletterPage(globalState: GlobalState): Promise<{ swarmReference: string }> {
    const head = `<title>${globalState.configuration.title}</title>${createStyleSheet(0)}`
    const body = `
    ${createHeader(globalState, 0, 'Latest')}
    <main>
        <div class="grid-container content-area">
            <div class="grid-3"></div>
            <div class="grid-6">
                <form
                    autocomplete="false"
                    role="form"
                    method="post"
                    action="https://mautic.int.ethswarm.org/form/submit?formId=4"
                    id="mauticform_websitenewslettersubscription"
                    data-mautic-form="websitenewslettersubscription"
                    enctype="multipart/form-data"
                >
                    <input
                        id="mauticform_input_websitenewslettersubscription_email_address"
                        name="mauticform[email_address]"
                        type="email"
                        placeholder="Enter your email address"
                        required=""
                    />
                    <input type="hidden" name="mauticform[formId]" id="mauticform_websitenewslettersubscription_id" value="4" />
                    <input type="hidden" name="mauticform[return]" id="mauticform_websitenewslettersubscription_return" value="" />
                    <input
                        type="hidden"
                        name="mauticform[formName]"
                        id="mauticform_websitenewslettersubscription_name"
                        value="websitenewslettersubscription"
                    />
                    <input name="mauticform[gdpr_accepted]" id="mauticform_radiogrp_radio_gdpr_accepted_Yes0" type="hidden" value="1" />
                    <input
                        name="mauticform[i_consent_to_gathering_an]"
                        id="mauticform_radiogrp_radio_i_consent_to_gathering_an_Yes0"
                        type="hidden"
                        value="1"
                    />
                    <button name="mauticform[submit]" id="mauticform_input_websitenewslettersubscription_submit" value="" type="submit">
                        Subscribe
                    </button>
                </form>
                <p class="disclaimer">By clicking on Subscribe you consent to usage of your given e-mail address for receiving communication and news about the Swarm project and news. Data will be controlled and processed by Swarm Foundation.</p>
            </div>
        </div>
    </main>
    ${createFooter(globalState, 0)}
`
    const html = createHtml5(head, body)
    const htmlResults = await globalState.bee.uploadData(globalState.stamp, html)
    await exportToWeb2('newsletter.html', html)
    return {
        swarmReference: htmlResults.reference
    }
}
