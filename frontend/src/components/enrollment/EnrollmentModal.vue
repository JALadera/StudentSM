<template>
  <div v-if="show" class="fixed inset-0 bg-black bg-opacity-75 overflow-y-auto h-full w-full z-50">
    <div class="relative top-20 mx-auto p-6 border w-[480px] shadow-lg rounded-lg bg-[#1a1a1a] border-gray-800">
      <div class="mt-2">
        <h3 class="text-xl font-medium text-gray-200 mb-6">
          Enroll in Subjects
        </h3>
        
        <div v-if="error" class="mb-4 p-4 bg-red-900/30 text-red-400 rounded-md">
          {{ error }}
        </div>

        <form @submit.prevent="handleEnroll" class="space-y-6">
          <div class="space-y-4">
            <div v-for="subject in availableSubjects" :key="subject.id" 
                 class="flex items-center p-3 bg-[#242424] rounded-md">
              <input
                type="checkbox"
                :value="subject.id"
                v-model="selectedSubjects"
                :id="'subject-' + subject.id"
                class="h-4 w-4 text-red-600 focus:ring-red-600 bg-[#141414] border-gray-800 rounded"
              >
              <label :for="'subject-' + subject.id" class="ml-3 block text-sm text-gray-300">
                <span class="font-medium">{{ subject.code }} - {{ subject.name }}</span>
                <span class="text-gray-500 text-xs block">{{ subject.units }} units</span>
              </label>
            </div>
          </div>

          <div class="flex justify-end space-x-4">
            <button
              type="button"
              @click="close"
              class="px-4 py-2 text-sm font-medium text-gray-400 bg-[#141414] rounded-md hover:bg-[#1f1f1f] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="loading || selectedSubjects.length === 0"
              class="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors"
            >
              {{ loading ? 'Enrolling...' : `Enroll in ${selectedSubjects.length} subject(s)` }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useToast } from 'vue-toastification';
import axios from 'axios'
import { subjectsService } from '@/services/api/subjects';
import { studentsService } from '@/services/api/students';

const props = defineProps({
  studentId: {
    type: [String, Number],
    required: true
  },
  show: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['close', 'enrolled']);

const subjects = ref([]);
const selectedSubjects = ref([]);
const loading = ref(false);
const error = ref('');
const toast = useToast();

// Computed property for available subjects (not already enrolled)
const availableSubjects = computed(() => {
  return subjects.value.filter(subject => 
    !enrolledSubjects.value.some(es => es.id === subject.id)
  );
});

// Track enrolled subjects to prevent duplicate enrollment
const enrolledSubjects = ref([]);

// Fetch subjects and check enrollment status
const fetchData = async () => {
  try {
    loading.value = true;
    
    // Fetch all subjects
    const [subjectsData, enrolledData] = await Promise.all([
      subjectsService.getSubjectList(),
      studentsService.getEnrollments(props.studentId)
    ]);
    
    subjects.value = subjectsData;
    enrolledSubjects.value = enrolledData || [];
    
  } catch (err) {
    console.error('Error fetching data:', err);
    toast.error('Failed to load data. Please try again.');
  } finally {
    loading.value = false;
  }
};

const handleEnroll = async () => {
  if (selectedSubjects.value.length === 0) {
    error.value = 'Please select at least one subject';
    return;
  }

  loading.value = true;
  error.value = '';

  try {
    // Get student details to ensure we have the correct student_id
    const student = await studentsService.getStudent(props.studentId);
    
    // Process enrollments in parallel
    const results = await Promise.allSettled(
      selectedSubjects.value.map(subjectId => 
        subjectsService.enrollStudent({
          subject: subjectId,
          student: student.student_id
        })
      )
    );
    
    // Check for any failed enrollments
    const failedEnrollments = results
      .map((result, index) => ({
        subjectId: selectedSubjects.value[index],
        error: result.status === 'rejected' ? result.reason : null
      }))
      .filter(item => item.error);
    
    if (failedEnrollments.length > 0) {
      console.error('Some enrollments failed:', failedEnrollments);
      if (failedEnrollments.length === selectedSubjects.value.length) {
        throw new Error('Failed to enroll in any subjects. Please try again.');
      }
      toast.warning(`Enrolled in some subjects, but ${failedEnrollments.length} failed.`);
    } else {
      toast.success('Successfully enrolled in all selected subjects');
    }
    
    emit('enrolled');
    close();
  } catch (err) {
    console.error('Error in enrollment process:', err);
    error.value = err.message || 'Failed to enroll student. Please try again.';
    toast.error(error.value);
  } finally {
    loading.value = false;
  }
};

const close = () => {
  selectedSubjects.value = [];
  error.value = '';
  emit('close');
};

// Watch for modal open to refresh data
onMounted(() => {
  if (props.show) {
    fetchData();
  }
});

// Watch for show prop changes
watch(() => props.show, (newVal) => {
  if (newVal) {
    fetchData();
  } else {
    close();
  }
});
</script>