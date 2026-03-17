/**
 * For the full copyright and license information, please view the
 * docs/licenses/LICENSE.txt file that was distributed with this source code.
 */

// Initialize zxcvbn-ts with language packages
(function() {
  if (typeof zxcvbnts !== 'undefined' && zxcvbnts.core && zxcvbnts['language-common'] && zxcvbnts['language-en']) {
    const options = {
      translations: zxcvbnts['language-en'].translations,
      graphs: zxcvbnts['language-common'].adjacencyGraphs,
      dictionary: {
        ...zxcvbnts['language-common'].dictionary,
        ...zxcvbnts['language-en'].dictionary,
      },
    };
    zxcvbnts.core.zxcvbnOptions.setOptions(options);
    // Create global zxcvbn function for backward compatibility
    window.zxcvbn = function(password) {
      return zxcvbnts.core.zxcvbn(password);
    };
  }
})();

$(function() {
  checkTimeZone($('#infosCountry'));
  // When a country is changed
  $('#infosCountry').on('change', function()
	{
	  checkTimeZone(this);
  });

  watchPasswordStrength($('#infosPassword'), '#btNext');

  // Safety net: prevent submit (e.g. via Enter key) when password does not meet requirements
  $('#mainForm').on('submit', function(e) {
    const $passwordInput = $('#infosPassword');
    if ($passwordInput.length === 0) {
      return;
    }
    const passwordValue = $passwordInput.val();
    if (!passwordValue) {
      return;
    }
    const minScore = $passwordInput.data('minscore');
    const minLength = $passwordInput.data('minlength');
    const maxLength = $passwordInput.data('maxlength');
    const result = zxcvbn(passwordValue);
    const scoreValid = result.score >= minScore;
    const lengthValid = passwordValue.length >= minLength && passwordValue.length <= maxLength;
    if (!scoreValid || !lengthValid) {
      e.preventDefault();
      e.stopImmediatePropagation();
      return false;
    }
  });
});

function checkTimeZone(elt)
{
  var iso = $(elt).val();

  // Get timezone by iso
  $.ajax({
	url: 'index.php',
	data: 'timezoneByIso=true&iso='+iso,
	dataType: 'json',
	cache: true,
	success: function(json) {
	  if (json.success) {
		$('#infosTimezone').val(json.message).trigger("liszt:updated");
		if (in_array(iso, ['br','us','ca','ru','me','au','id']))
		{
		  if ($('#infosTimezone:visible').length == 0 && $('#infosTimezone_chosen').length == 0)
		  {
			$('#infosTimezone:hidden').show();
			$('#timezone_div').show();
			$('#infosTimezone').chosen();
		  }
		  $('#timezone_div').show();
		}
		else
		  $('#timezone_div').hide();
	  }
	}
  });
}

function in_array(needle, haystack) {
  var length = haystack.length;
  for (var i = 0; i < length; i++) {
    if (haystack[i] == needle)
	  return true;
  }
  return false;
}

/**
 * Watch password, which is entered in the input, strength and inform about it.
 * When submitButtonSelector is provided, also disables the submit button when password
 * does not meet minimum strength or length, and shows the error message in the feedback area.
 *
 * @param {jQuery} element the input to watch.
 * @param {string} [submitButtonSelector] optional selector for the form submit button to disable when password is invalid.
 */
function watchPasswordStrength(element, submitButtonSelector) {
  element.on('keyup', function checkPasswordStrength() {
    const $passwordInput = $(this);
    const $fieldPassword = $passwordInput.closest('.field-password');
    $fieldPassword.find('.js-password-client-error').hide();
    const passwordValue = $passwordInput.val();
    const popoverElement = $('.field-password .popover');
    let $feedbackContainer = $passwordInput.parent().find('.password-strength-feedback');

    if ($feedbackContainer.length === 0) {
      $passwordInput.parent().append($('#password-feedback').html());
      $feedbackContainer = $passwordInput.parent().find('.password-strength-feedback');
    }

    const passwordRequirementsLength = $feedbackContainer.find('.password-requirements-length');
    passwordRequirementsLength.find('span').text(
      sprintf(
        passwordRequirementsLength.data('translation'),
        $passwordInput.data('minlength'),
        $passwordInput.data('maxlength'),
      ),
    );

    const passwordRequirementsScore = $feedbackContainer.find('.password-requirements-score');
    passwordRequirementsScore.find('span').text(
      sprintf(
        passwordRequirementsScore.data('translation'),
        $feedbackContainer.data('translations')[$passwordInput.data('minscore')],
      ),
    );

    if (passwordValue === '') {
      $feedbackContainer.toggleClass('d-none', true);
      popoverElement.toggleClass('d-none', true);
      if (submitButtonSelector) {
        $(submitButtonSelector).prop('disabled', false);
      }
    } else {
      const result = zxcvbn(passwordValue);
      displayFeedback($passwordInput, $feedbackContainer, result);
      $feedbackContainer.removeClass('d-none');

      const minScore = $passwordInput.data('minscore');
      const minLength = $passwordInput.data('minlength');
      const maxLength = $passwordInput.data('maxlength');
      const scoreValid = result.score >= minScore;
      const lengthValid = passwordValue.length >= minLength && passwordValue.length <= maxLength;
      const isValid = scoreValid && lengthValid;

      if (submitButtonSelector) {
        $(submitButtonSelector).prop('disabled', !isValid);
      }
      if (!isValid) {
        const errorMessage = $fieldPassword.data('passwordMustBeStrong')
          || 'The password must be strong (see requirements above).';
        $fieldPassword.find('.js-password-client-error').show().text(errorMessage);
      }
    }
  });
}

/**
 * Display feedback about password's strength.
 *
 * @param {jQuery} $passwordInput The currenct password field
 * @param {jQuery} $outputContainer a container to put feedback output into.
 * @param {ZXCVBNResult} result
 *
 * @private
 */
function displayFeedback(
  $passwordInput,
  $outputContainer,
  result,
) {
  const feedback = getPasswordStrengthFeedback(result.score);
  const translations = $outputContainer.data('translations');
  const popoverContent = [];
  const popoverElement = $('.field-password .popover');
  const popoverBody = $('.popover-body', popoverElement);

  $outputContainer.find('.password-strength-text').text(translations[result.score]);

  if (result.feedback.warning !== '') {
    if (result.feedback.warning in translations) {
      popoverContent.push(translations[result.feedback.warning]);
    }
  }

  result.feedback.suggestions.forEach((suggestion) => {
    if (suggestion in translations) {
      popoverContent.push(translations[suggestion]);
    }
  });

  popoverBody.html(popoverContent.join('<br>'));

  const passwordLength = $passwordInput.val().length;

  popoverElement.toggleClass('d-none', popoverContent.length <= 0);

  const passwordLengthValid = passwordLength >= $passwordInput.data('minlength')
    && passwordLength <= $passwordInput.data('maxlength');
  $outputContainer.find('.password-requirements-length svg').toggleClass(
    'text-success',
    passwordLengthValid,
  );

  const passwordScoreValid = $passwordInput.data('minscore') <= result.score;
  $outputContainer.find('.password-requirements-score svg').toggleClass(
    'text-success',
    passwordScoreValid,
  );

  $passwordInput
    .removeClass()
    .addClass(passwordScoreValid && passwordLengthValid ? 'border-success' : 'border-danger')
    .addClass('form-control border');

  // Calculate the pourcentage of the bar, depending on the score.
  const percentage = (result.score * 20) + 20;

  // increase and decrease progress bar
  $outputContainer
    .find('.progress-bar')
    .width(`${percentage}%`)
    .css('visibility', 'visible')
    .css('background-color', feedback.color);
}

/**
 * Get feedback that describes given password strength.
 * Response contains text message and element class.
 *
 * @param {number} strength
 *
 * @private
 */
function getPasswordStrengthFeedback(
  strength
) {
  switch (strength) {
  case 0:
    return {
      color: '#BA151A',
    };

  case 1:
    return {
      color: '#BA151A',
    };

  case 2:
    return {
      color: '#FFA000',
    };

  case 3:
    return {
      color: '#207F4B',
    };

  case 4:
    return {
      color: '#207F4B',
    };

  default:
    throw new Error('Invalid password strength indicator.');
  }
}
